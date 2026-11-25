import { useRef } from 'react'
import { supabase } from '../services/supabaseClient'

export type PointExtraImage = {
  id: string
  extra_id: string
  image_path: string
  caption: string | null
  author: string | null
  license: string | null
  license_url: string | null
  source_url: string | null
  modifications: string | null
  sort_order: number
}

function QsmImage({ image }: { image: PointExtraImage }) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  const imageUrl = supabase.storage
    .from('qsm-images')
    .getPublicUrl(image.image_path).data.publicUrl

  return (
    <figure className="mt-4">
      <button
        type="button"
        onClick={() => dialogRef.current?.showModal()}
        className="block w-full cursor-pointer overflow-hidden rounded-xl"
        aria-label="Ampliar fotografía"
      >
        <img
          src={imageUrl}
          alt={image.caption || 'Fotografía complementaria'}
          loading="lazy"
          className="h-auto w-full"
        />
      </button>

      <p className="mt-1 text-center text-xs text-teal-700">
        Pulsa sobre la imagen para ampliarla
      </p>

      <figcaption className="mt-2 text-xs leading-relaxed text-gray-600">
        {image.caption && (
          <p className="mb-2 font-medium">
            {image.caption}
          </p>
        )}

        {image.author && (
          <p>Fotografía: {image.author}</p>
        )}

        {image.license && (
          <p>
            Licencia:{' '}
            {image.license_url ? (
              <a
                href={image.license_url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-teal-700 underline"
              >
                {image.license}
              </a>
            ) : (
              image.license
            )}
          </p>
        )}

        {image.source_url && (
          <p>
            <a
              href={image.source_url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-teal-700 underline"
            >
              Fuente original
            </a>
          </p>
        )}

        {image.modifications && (
          <p>{image.modifications}</p>
        )}
      </figcaption>

      <dialog
        ref={dialogRef}
        className="fixed inset-0 m-auto max-h-[95dvh] w-[95vw] max-w-4xl overflow-auto rounded-2xl bg-black p-3 text-white backdrop:bg-black/80"
      >
        <div className="mb-3 flex justify-end">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-black"
          >
            Cerrar ✕
          </button>
        </div>

        <img
          src={imageUrl}
          alt={image.caption || 'Fotografía ampliada'}
          loading="lazy"
          className="max-h-[75dvh] w-full object-contain"
        />

        {image.caption && (
          <p className="mt-3 text-center text-sm">
            {image.caption}
          </p>
        )}
      </dialog>
    </figure>
  )
}

export default function QsmImages({
  images,
}: {
  images: PointExtraImage[]
}) {
  if (images.length === 0) return null

  return (
    <div>
      {[...images]
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((image) => (
          <QsmImage key={image.id} image={image} />
        ))}
    </div>
  )
}