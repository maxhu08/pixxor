'use client'

import { handleImageUpload } from '@/utils/handle-image-upload'
import { UploadButton } from '@/utils/uploadthing'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={async (res) => {
          console.log('Files:', res)

          alert('Upload Completed')
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </main>
  )
}

