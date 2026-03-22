import { CodeBlockActions, CodeBlockContainer, CodeBlockContent, CodeBlockFilename, CodeBlockHeader, CodeBlockTitle } from "@/components/ai-elements/code-block"
import { RunCodeDrawer } from "@/components/code-share/run-code-drawer"
import { Button } from "@/components/ui/button"
import { FileIcon } from "lucide-react"
import { BundledLanguage } from "shiki"
import { getFileContentByPath } from "@/lib/actons/file"

const StaticServe = async ({ params }: { params: Promise<{ path: string[] }> }) => {
    const { path } = await params
    let joinedPath = path.join('/')
    joinedPath = joinedPath.startsWith('/') ? joinedPath : `/${joinedPath}`
    const language = "bash"
    const filename = joinedPath

    const response = await getFileContentByPath(joinedPath)

    if (!response) {
        return (
            <div className="flex flex-col h-[70vh] items-center justify-center text-destructive">
                Failed to load file content or file not found.
            </div>
        )
    }

    const code = await response.text()

    return (
        <div className="flex flex-col max-h-[70vh]">
            <CodeBlockContainer language={language} >
                <CodeBlockHeader>
                    <CodeBlockTitle className="w-full">
                        <FileIcon size={14} />
                        <CodeBlockFilename>{filename}</CodeBlockFilename>
                    </CodeBlockTitle>
                    <RunCodeDrawer code={code} language={language}><Button size="sm" className="h-8 text-xs">Run</Button></RunCodeDrawer>
                    <CodeBlockActions>
                    </CodeBlockActions>
                </CodeBlockHeader>

                <div className="overflow-auto max-h-[70vh] min-h-0">
                    <CodeBlockContent
                        code={code}
                        showLineNumbers
                        language={language as BundledLanguage}
                    />
                </div>

            </CodeBlockContainer>
        </div>
    )
}

export default StaticServe