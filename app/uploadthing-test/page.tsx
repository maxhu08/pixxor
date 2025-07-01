'use client'

import { createClient } from '@/lib/supabase/server'
import { handleImageUpload } from '@/utils/handle-image-upload'
import { UploadButton } from '@/utils/uploadthing'

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <UploadButton
        endpoint="imageUploader"
        onClientUploadComplete={async (res) => {
          console.log('Files:', res)

          const supabase = await createClient()
          const { data, error } = await supabase.auth.getUser()

          if (error || !data?.user) return

          await handleImageUpload(res, data.user.id)

          alert('Upload Completed')
        }}
        onUploadError={(error: Error) => {
          alert(`ERROR! ${error.message}`)
        }}
      />
    </main>
  )
}

