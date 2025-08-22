import { RefreshCw } from "lucide-react"

const UILoading = () => {
    return (
        <p className="text-center h-full py-4 flex justify-center gap-4 items-center">Loading... <RefreshCw className="animate-spin size-5" /> </p>
    )
}

export default UILoading