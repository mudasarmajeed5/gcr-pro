/* eslint-disable */

import { NextResponse } from 'next/server';
import { auth } from '@/auth';
import { getSettings } from '@/actions/get-settings';
import nodemailer, { SendMailOptions } from 'nodemailer';

export async function POST(req: Request) {
    try {
        const session = await auth();

        if (!session?.user?.email) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await req.json();
        const { to, subject, content, attachments } = body;

        if (to !== "mudasarmajeed5@gmail.com" || !subject || !content) {
            return NextResponse.json({
                error: 'To, subject, and content are required'
            }, { status: 400 });
        }
        const settingsResult = await getSettings();

        if (!settingsResult.success) {
            return NextResponse.json({
                error: 'Failed to get user settings'
            }, { status: 500 });
        }

        const { smtpPassword } = settingsResult.message;

        if (!smtpPassword) {
            return NextResponse.json({
                error: 'SMTP password not configured'
            }, { status: 400 });
        }

        // Create transporter
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            port: 587,
            secure: false,
            auth: {
                user: session.user.email,
                pass: smtpPassword,
            },
        });

        // Prepare mail options
        const mailOptions: SendMailOptions = {
            from: session.user.email,
            to: to,
            subject: subject,
            text: content,
        };

        // Add attachments if provided
        if (attachments && attachments.length > 0) {
            mailOptions.attachments = attachments.map((attachment: any ) => ({
                filename: attachment.filename,
                content: attachment.content,
                contentType: attachment.contentType,
            }));
        }

        await transporter.sendMail(mailOptions);

        return NextResponse.json({
            message: 'Email sent successfully'
        }, { status: 200 });

    } catch (err) {
        console.error('Email sending error:', err);
        return NextResponse.json({
            error: 'Failed to send email'
        }, { status: 500 });
    }
}