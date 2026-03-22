"use client"
import { FileDropzone } from '@/components/file/file-dropzone'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from '@/components/ui/field'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select'
import { zodResolver } from "@hookform/resolvers/zod"
import { Controller, useForm } from 'react-hook-form'
import z from 'zod'

import { zodToFormData } from '@/lib/utils'
import { useUploadFile } from '@/lib/hooks/use-files'
import { toast } from 'sonner'
import { UserFullInfo } from '@/shared/types'


const fileFormSchema = z.object({
    file: z.instanceof(File),
    name: z.string().min(1, "Name is required"),
    path: z.string().min(1, "Path is required"),
    password: z.string().optional(),
    mode: z.enum(['source', 'render'], { required_error: "Mode is required" }).default('source'),
    visibility: z.string().optional().default('public'),
})

interface InitialDataProps {
    name: string
    path: string
    password: string
    mode: "source" | "render"
    visibility: string
}

export const FileForm = ({ user, initialData }: { user: UserFullInfo, initialData?: InitialDataProps }) => {
    const { mutate: uploadFile, isPending } = useUploadFile()
    const form = useForm<z.infer<typeof fileFormSchema>>({
        resolver: zodResolver(fileFormSchema),
        defaultValues: {
            name: initialData?.name || "",
            password: initialData?.password || "",
            file: undefined,
            path: initialData?.path || `/${user.username}/`,
            mode: initialData?.mode || 'source',
            visibility: initialData?.visibility || 'public'
        }
    })

    const onSubmit = (data: z.infer<typeof fileFormSchema>) => {
        const formData = zodToFormData(data);

        uploadFile(formData, {
            onSuccess: () => {
                toast.success("File uploaded successfully")
                form.reset()
            },
            onError: (error) => {
                toast.error(error instanceof Error ? error.message : "Failed to upload file")
            }
        })
    };

    return (
        <Card className='w-full max-w-7xl mx-auto'>
            <CardHeader>
                <CardTitle>
                    Upload File
                </CardTitle>
            </CardHeader>
            <CardContent>
                <form onSubmit={form.handleSubmit(onSubmit)}>
                    <FieldGroup >
                        <Controller
                            name='file'
                            control={form.control}
                            render={({ field, fieldState }) => (
                                <Field >
                                    <FieldLabel>
                                        File
                                    </FieldLabel>
                                    <FileDropzone
                                        maxSize={10 * 1024 * 1024}
                                        maxFiles={1}
                                        value={field.value}
                                        onChange={field.onChange}
                                    />
                                    {
                                        fieldState.invalid && <FieldError errors={[fieldState.error]}></FieldError>
                                    }
                                </Field>
                            )}
                        />
                        <div className='w-full grid gap-4 md:grid-cols-2 grid-cols-1'>
                            <Controller
                                name='name'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field >
                                        <FieldLabel>
                                            Name
                                        </FieldLabel>
                                        <Input
                                            id='form-file-name'
                                            {...field} placeholder='enter the name of ur file'
                                        />
                                        {
                                            fieldState.invalid && <FieldError errors={[fieldState.error]}></FieldError>
                                        }
                                    </Field>
                                )}
                            />

                            <Controller
                                name='path'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field >
                                        <FieldLabel>
                                            Path
                                        </FieldLabel>
                                        <FieldDescription>
                                            make sure the path is starts with /{user.username}/
                                        </FieldDescription>
                                        <Input
                                            {...field}
                                            placeholder="enter the file path"
                                            className="border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 rounded-l-none"
                                        />
                                        {
                                            fieldState.invalid && <FieldError errors={[fieldState.error]}></FieldError>
                                        }
                                    </Field>
                                )}
                            />

                            <Controller
                                name='password'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field >
                                        <FieldLabel>
                                            Password
                                        </FieldLabel>
                                        <Input
                                            id='form-file-password'
                                            {...field} placeholder='password (optional)'
                                        />
                                        {
                                            fieldState.invalid && <FieldError errors={[fieldState.error]}></FieldError>
                                        }
                                    </Field>
                                )}
                            />
                            <Controller
                                name='mode'
                                control={form.control}
                                render={({ field, fieldState }) => (
                                    <Field >
                                        <FieldLabel>
                                            Mode
                                        </FieldLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <SelectTrigger className="w-full max-w-48">
                                                <SelectValue placeholder="select a mode" />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectGroup>
                                                    <SelectLabel>Mode</SelectLabel>
                                                    <SelectItem value="source">Source</SelectItem>
                                                    <SelectItem value="render">Render</SelectItem>
                                                </SelectGroup>
                                            </SelectContent>
                                        </Select>
                                        {
                                            fieldState.invalid && <FieldError errors={[fieldState.error]}></FieldError>
                                        }
                                    </Field>
                                )}
                            />
                        </div>
                    </FieldGroup>
                    <Button type="submit" className='mt-2' disabled={isPending}>
                        {isPending ? "Uploading..." : "Upload"}
                    </Button>
                </form>
            </CardContent>

        </Card>
    )
}
