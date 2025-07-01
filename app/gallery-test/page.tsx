import { createClient } from '@/lib/supabase/server'

export default async function AlbumsPage() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <p>You must be logged in to view this page.</p>
  }

  const { data: albumMembers, error: albumMembersError } = await supabase
    .from('album_members')
    .select('album_id')
    .eq('user_id', user.id)

  if (albumMembersError) throw albumMembersError

  const albumIds = albumMembers?.map(m => m.album_id) ?? []

  if (albumIds.length === 0) {
    return <p>No albums found for this user.</p>
  }

  const { data: albums, error: albumsError } = await supabase
    .from('albums')
    .select('id, name')
    .in('id', albumIds)
    .order('created_at', { ascending: false })

  if (albumsError) throw albumsError

  if (!albums || albums.length === 0) {
    return <p>No albums found for this user.</p>
  }

  const { data: images, error: imagesError } = await supabase
    .from('images')
    .select('id, url, album_id')
    .in('album_id', albumIds)
    .order('created_at', { ascending: false })

  if (imagesError) throw imagesError

  const imagesByAlbum = images?.reduce<Record<string, typeof images>>((acc, img) => {
    if (!acc[img.album_id]) acc[img.album_id] = []
    acc[img.album_id].push(img)
    return acc
  }, {}) ?? {}

  return (
    <div className="p-6 space-y-10">
      {albums.map(album => (
        <section key={album.id}>
          <h2 className="text-xl font-semibold mb-4">{album.name}</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(imagesByAlbum[album.id] ?? []).map(img => (
              <div key={img.id} className="rounded overflow-hidden">
                <img
                  src={img.url}
                  alt={`Image from album ${album.name}`}
                  className="w-full h-auto object-cover rounded"
                />
              </div>
            ))}
            {(!imagesByAlbum[album.id] || imagesByAlbum[album.id].length === 0) && (
              <p className="text-gray-500">No images in this album.</p>
            )}
          </div>
        </section>
      ))}
    </div>
  )
}

