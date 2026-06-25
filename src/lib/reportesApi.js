import { createClient } from './supabase/client'

const supabase = createClient()

function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(',')
  const mime = header.match(/:(.*?);/)?.[1] || 'image/jpeg'
  const binary = atob(base64)
  const array = new Uint8Array(binary.length)

  for (let i = 0; i < binary.length; i++) {
    array[i] = binary.charCodeAt(i)
  }

  return new Blob([array], { type: mime })
}

async function subirFoto(fotoBase64) {
  if (!fotoBase64) return ''

  if (!fotoBase64.startsWith('data:image')) {
    return fotoBase64
  }

  const blob = dataUrlToBlob(fotoBase64)
  const fileName = `${Date.now()}-${crypto.randomUUID()}.jpg`
  const path = `reportes/${fileName}`

  const { error } = await supabase.storage
    .from('danos-fotos')
    .upload(path, blob, {
      contentType: blob.type || 'image/jpeg',
      upsert: false,
    })

  if (error) {
    console.error('Error subiendo foto:', error)
    throw error
  }

  const { data } = supabase.storage
    .from('danos-fotos')
    .getPublicUrl(path)

  return data.publicUrl
}

function fromDb(row) {
  return {
    id: row.id,
    foto: row.foto_url || '',
    nombre: row.nombre || '',
    direccion: row.direccion || '',
    ciudad: row.ciudad || '',
    zona: row.zona || '',
    tipo: row.tipo || '',
    nivel: row.nivel || 'parcial',
    atrapados: row.atrapados || 'nose',
    descripcion: row.descripcion || '',
    fuente: row.fuente || '',
    reportanteNombre: '',
    contacto: '',
lat: row.lat ?? null,
lng: row.lng ?? null,
    fecha: row.created_at,
  }
}

export async function cargarReportesApi() {
  const { data, error } = await supabase
    .from('reportes_danos')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error cargando reportes:', error)
    throw error
  }

  return data.map(fromDb)
}

export async function crearReporteApi(reporte) {
  const fotoUrl = await subirFoto(reporte.foto)

  const payload = {
    nombre: reporte.nombre,
    direccion: reporte.direccion || null,
    ciudad: reporte.ciudad,
    zona: reporte.zona || null,
    tipo: reporte.tipo || null,
    nivel: reporte.nivel,
    atrapados: reporte.atrapados,
    descripcion: reporte.descripcion || null,
    fuente: reporte.fuente || null,
lat: reporte.lat ?? null,
lng: reporte.lng ?? null,
    foto_url: fotoUrl || null,
  }

  const { data, error } = await supabase
    .from('reportes_danos')
    .insert(payload)
    .select()
    .single()

  if (error) {
    console.error('Error creando reporte:', error)
    throw error
  }

  if (reporte.reportanteNombre || reporte.contacto) {
    const { error: privateError } = await supabase
      .from('reportantes_privados')
      .insert({
        reporte_id: data.id,
        reportante_nombre: reporte.reportanteNombre || null,
        contacto: reporte.contacto || null,
      })

    if (privateError) {
      console.error('Error guardando datos privados:', privateError)
    }
  }

  return fromDb(data)
}