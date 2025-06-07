import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { api } from "convex/_generated/api";
import { useMutation } from "convex/react";
import { Loader2, Upload } from "lucide-react";
import { useState } from "react";
import { type FileWithPath, useDropzone } from "react-dropzone";

type ImageUploadProps = {
  className?: string;
  value: string;
  onChange: (value: string) => void;
};

export function ImageUpload(props: ImageUploadProps) {
  const generateUrl = useMutation(api.upload.generateUrl);
  const [isPending, setIsPending] = useState(false);
  const [isImageLoading, setIsImageLoading] = useState(false);
  const upload = async (file: FileWithPath) => {
    setIsPending(true);
    try {
      const url = await generateUrl();

      const response = await fetch(url, {
        method: "POST",
        body: file,
        headers: { "Content-Type": file.type },
      });

      const { storageId } = await response.json();

      props.onChange(
        String(import.meta.env.VITE_CONVEX_SITE_URL) +
          "/image?storageId=" +
          storageId
      );
    } catch (e) {
      console.log(e);
    }
    setIsPending(false);
  };

  const onDrop = async (accepted: FileWithPath[]) => {
    const file = accepted[0];

    if (!file) {
      return;
    }

    await upload(file);
  };

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: {
      "image/*": [],
    },
  });
  return (
    <div className="flex">
      <div
        className={cn(
          "bg-muted relative rounded-lg overflow-hidden",
          props.className
        )}
        {...getRootProps()}
      >
        {(isPending || isImageLoading) && (
          <div className="absolute inset-0 z-10 flex items-center justify-center rounded-lg bg-black/50">
            <Loader2 className="h-8 w-8 animate-spin text-white" />
          </div>
        )}
        <Avatar className="cursor-pointer rounded-none h-full w-full">
          <input {...getInputProps()} />

          <AvatarImage
            className="object-cover"
            src={props.value}
            onLoad={() => setIsImageLoading(false)}
            onLoadStart={() => setIsImageLoading(true)}
            onError={() => setIsImageLoading(false)}
          />
          <AvatarFallback className="rounded-none">
            <Upload className="text-muted-foreground" />
          </AvatarFallback>
        </Avatar>
      </div>
    </div>
  );
}
