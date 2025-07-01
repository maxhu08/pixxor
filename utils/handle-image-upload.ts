import { createClient } from '@/lib/supabase/server'
import type { UploadedFileData } from 'uploadthing/types'

export async function handleImageUpload(file: UploadedFileData) {
  const supabase = await createClient()
  const { data: authData, error: authError } = await supabase.auth.getUser()

  if (authError || !authData?.user) {
    return { success: false }
  }

  const { data: album, error: albumFetchError } = await supabase
    .from('albums')
    .select('id')
    .eq('name', 'Unsorted')
    .single()

  let albumId = album?.id

  if (albumFetchError && albumFetchError.code !== 'PGRST116') {
    throw albumFetchError
  }

  if (!albumId) {
    const { data: newAlbum, error: albumCreateError } = await supabase
      .from('albums')
      .insert({ name: 'Unsorted' })
      .select('id')
      .single()

    if (albumCreateError || !newAlbum) {
      throw albumCreateError
    }

    albumId = newAlbum.id

    const { error: memberError } = await supabase
      .from('album_members')
      .insert({ user_id: authData.user.id, album_id: albumId })

    if (memberError) {
      throw memberError
    }
  }

  const { error: imageInsertError } = await supabase
    .from('images')
    .insert([{ album_id: albumId, url: file.url }])

  if (imageInsertError) {
    throw imageInsertError
  }

  return { success: true }
}