import { createClient } from '@/lib/supabase/server';
import type { UploadedFileData } from 'uploadthing/types';

export async function handleImageUpload(file: UploadedFileData, userId: string) {
  console.log('1: Starting handleImageUpload');
  const supabase = await createClient();
  console.log('2: Supabase client created');

  if (!userId) {
    console.log('3: No userId provided, returning failure');
    return { success: false };
  }

  let albumId: string | undefined;

  console.log('4: Fetching "Unsorted" album');
  const { data: album, error: albumFetchError } = await supabase
    .from('albums')
    .select('id')
    .eq('name', 'Unsorted')
    .single();

  if (albumFetchError && albumFetchError.code !== 'PGRST116') {
    console.log('5: Album fetch error', albumFetchError);
    throw albumFetchError;
  }

  albumId = album?.id;
  console.log('6: albumId after fetch:', albumId);

  if (!albumId) {
    console.log('7: No "Unsorted" album found, creating new album');
    const { data: newAlbum, error: albumCreateError } = await supabase
      .from('albums')
      .insert({ name: 'Unsorted' })
      .select('id')
      .single();

    if (albumCreateError || !newAlbum) {
      console.log('8: Error creating album', albumCreateError);
      throw albumCreateError;
    }

    albumId = newAlbum.id;
    console.log('9: New album created with id', albumId);

    const { error: memberError } = await supabase
      .from('album_members')
      .insert({ user_id: userId, album_id: albumId });

    if (memberError) {
      console.log('10: Error adding user to album_members', memberError);
      throw memberError;
    }
    console.log('11: User added to album_members');
  }

  console.log('12: Inserting image into images table');
  const { error: imageInsertError } = await supabase
    .from('images')
    .insert([{ user_id: userId, album_id: albumId, url: file.ufsUrl, filename: file.name }]);

  if (imageInsertError) {
    console.log('13: Error inserting image', imageInsertError);
    throw imageInsertError;
  }

  console.log('14: Image uploaded successfully');
  return { success: true };
}

