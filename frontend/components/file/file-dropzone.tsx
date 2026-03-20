"use client"

import { useCallback, useState, useMemo } from "react"
import { useDropzone, type FileRejection, type Accept } from "react-dropzone"
import { cn } from "@/lib/utils"
import { CloudUpload, File as FileIcon, X, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

interface FileDropzoneProps {
    value?: File | File[] | null
    accept?: Accept
    maxSize?: number
    maxFiles?: number
    onChange?: (value: File | File[] | null) => void
    className?: string
}

function formatBytes(bytes: number) {
    if (bytes === 0) return "0 B"
    const k = 1024
    const sizes = ["B", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

export function FileDropzone({
    value,
    accept,
    maxSize = 10 * 1024 * 1024,
    maxFiles = 1,
    onChange,
    className,
}: FileDropzoneProps) {
    const [localError, setLocalError] = useState<string | null>(null)

    // Normalize value to array for consistent UI logic
    const files = useMemo(() => {
        if (!value) return []
        return Array.isArray(value) ? value : [value]
    }, [value])

    const onDrop = useCallback(
        (acceptedFiles: File[], rejectedFiles: FileRejection[]) => {
            setLocalError(null)

            if (rejectedFiles.length > 0) {
                const firstErr = rejectedFiles[0].errors[0]
                setLocalError(`${rejectedFiles[0].file.name}: ${firstErr.message}`)
                return
            }

            if (acceptedFiles.length > 0) {
                if (maxFiles === 1) {
                    onChange?.(acceptedFiles[0])
                } else {
                    onChange?.(acceptedFiles.slice(0, maxFiles))
                }
            }
        },
        [maxFiles, onChange]
    )

    const removeFile = (e: React.MouseEvent, index: number) => {
        e.stopPropagation()
        if (maxFiles === 1) {
            onChange?.(null)
        } else {
            const next = files.filter((_, i) => i !== index)
            onChange?.(next.length > 0 ? next : null)
        }
    }

    const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
        onDrop,
        accept,
        maxSize,
        maxFiles,
    })

    const hasFiles = files.length > 0

    return (
        <div className={cn("w-full space-y-2", className)}>
            <div
                {...getRootProps()}
                className={cn(
                    "relative flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed px-6 py-8 text-center transition-all duration-200",
                    "border-muted-foreground/20 bg-muted/20 hover:border-primary/40 hover:bg-muted/30",
                    isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.01]",
                    isDragReject && "border-destructive bg-destructive/5",
                    hasFiles && !isDragActive && "border-primary/20 bg-primary/5"
                )}
            >
                <input {...getInputProps()} />

                {!hasFiles ? (
                    <div className="flex flex-col items-center">
                        <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-muted shadow-sm">
                            <CloudUpload className={cn("h-6 w-6 text-muted-foreground", isDragActive && "text-primary")} />
                        </div>
                        <p className="text-sm font-medium text-foreground">
                            {isDragReject ? "File not accepted" : isDragActive ? "Drop here" : "Click or drag files"}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                            Up to {maxFiles} files (max {formatBytes(maxSize)})
                        </p>
                    </div>
                ) : (
                    <div className="flex w-full flex-col gap-2">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 rounded-lg border bg-background px-3 py-2 shadow-sm animate-in fade-in zoom-in-95 duration-200">
                                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/10">
                                    <FileIcon className="h-5 w-5 text-primary" />
                                </div>
                                <div className="min-w-0 flex-1 text-left">
                                    <p className="truncate text-sm font-medium">{file.name}</p>
                                    <p className="text-xs text-muted-foreground">{formatBytes(file.size)}</p>
                                </div>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                                    onClick={(e) => removeFile(e, i)}
                                >
                                    <X className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                        {isDragActive && (
                            <div className="mt-2 text-xs font-medium text-primary flex items-center justify-center gap-2">
                                <CloudUpload className="h-4 w-4" /> Keep dropping to replace
                            </div>
                        )}
                    </div>
                )}
            </div>

            {localError && (
                <div className="flex items-center gap-2 rounded-lg bg-destructive/5 px-3 py-2 text-xs text-destructive animate-in slide-in-from-top-1">
                    <AlertCircle className="h-3.5 w-3.5" />
                    <span>{localError}</span>
                </div>
            )}
        </div>
    )
}