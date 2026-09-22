import { supabase } from '../lib/supabase'

const MEMORIES_TABLE = 'memories'
const STORAGE_BUCKET = 'love-memories'

// Hàm xóa dấu tiếng Việt và ký tự đặc biệt để tránh lỗi Storage
const sanitizeFileName = (fileName) => {
  return fileName
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Xóa dấu
    .replace(/đ/g, 'd').replace(/Đ/g, 'D')
    .replace(/[^a-zA-Z0-9.]/g, '_') // Thay ký tự lạ bằng dấu gạch dưới
    .replace(/_+/g, '_'); // Xóa bớt gạch dưới thừa
}

export const supabaseService = {
  // 1. Lấy danh sách kỷ niệm
  getMemories: async () => {
    const { data, error } = await supabase
      .from(MEMORIES_TABLE)
      .select('*')
      .order('date', { ascending: false })
    
    if (error) throw error
    return data
  },

  // 2. Đăng ký nhận cập nhật Real-time
  subscribeMemories: (onUpdate) => {
    return supabase
      .channel('public:memories')
      .on('postgres_changes', { event: '*', schema: 'public', table: MEMORIES_TABLE }, (payload) => {
        onUpdate(payload)
      })
      .subscribe()
  },

  // 3. Thêm kỷ niệm mới
  addMemory: async (memoryData, files = []) => {
    const mediaUrls = []

    // Upload files to Supabase Storage
    for (const fileObj of files) {
      if (fileObj.file) {
        const cleanName = sanitizeFileName(fileObj.file.name)
        const filePath = `${Date.now()}_${cleanName}`

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, fileObj.file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)

        mediaUrls.push({ type: fileObj.type, url: publicUrl })
      } else if (fileObj.url) {
        mediaUrls.push(fileObj)
      }
    }

    const { data, error } = await supabase
      .from(MEMORIES_TABLE)
      .insert([{ ...memoryData, media: mediaUrls }])
      .select()

    if (error) throw error
    return data[0]
  },

  // 4. Cập nhật kỷ niệm
  updateMemory: async (id, memoryData, files = []) => {
    const mediaUrls = []

    for (const fileObj of files) {
      if (fileObj.file) {
        const cleanName = sanitizeFileName(fileObj.file.name)
        const filePath = `${Date.now()}_${cleanName}`

        const { data, error } = await supabase.storage
          .from(STORAGE_BUCKET)
          .upload(filePath, fileObj.file)

        if (error) throw error

        const { data: { publicUrl } } = supabase.storage
          .from(STORAGE_BUCKET)
          .getPublicUrl(filePath)

        mediaUrls.push({ type: fileObj.type, url: publicUrl })
      } else {
        mediaUrls.push(fileObj)
      }
    }

    const { data, error } = await supabase
      .from(MEMORIES_TABLE)
      .update({ ...memoryData, media: mediaUrls })
      .eq('id', id)
      .select()

    if (error) throw error
    return data[0]
  },

  // 5. Xóa kỷ niệm
  deleteMemory: async (id) => {
    const { error } = await supabase
      .from(MEMORIES_TABLE)
      .delete()
      .eq('id', id)
    
    if (error) throw error
  },

  // --- BUCKET LIST ---
  getBucketList: async () => {
    const { data, error } = await supabase.from('bucket_list').select('*').order('created_at', { ascending: true })
    if (error) throw error
    return data
  },

  addBucketItem: async (text, imageFile = null, subItems = [], locationName = "") => {
    let imageUrl = null
    if (imageFile) {
      const cleanName = sanitizeFileName(imageFile.name)
      const filePath = `bucket/${Date.now()}_${cleanName}`
      const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, imageFile)
      if (error) throw error
      imageUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath).data.publicUrl
    }

    const { data, error } = await supabase
      .from('bucket_list')
      .insert([{ 
        text, 
        image_url: imageUrl, 
        rotate: Math.floor(Math.random() * 10) - 5,
        sub_items: subItems,
        location_name: locationName
      }])
      .select()
    if (error) throw error
    return data[0]
  },

  toggleBucketItem: async (id, isCompleted, stampImageFile = null) => {
    let stampImageUrl = null
    const completedAt = isCompleted ? new Date().toISOString() : null

    if (isCompleted && stampImageFile) {
      const cleanName = sanitizeFileName(stampImageFile.name)
      const filePath = `stamps/${Date.now()}_${cleanName}`
      const { error: uploadError } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, stampImageFile)
      if (uploadError) throw uploadError
      stampImageUrl = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath).data.publicUrl
    }

    const updateData = { is_completed: isCompleted, completed_at: completedAt }
    if (stampImageUrl) updateData.stamp_image_url = stampImageUrl

    const { error } = await supabase
      .from('bucket_list')
      .update(updateData)
      .eq('id', id)
    
    if (error) throw error
    return { completedAt, stampImageUrl }
  },

  updateBucketSubItems: async (id, subItems) => {
    const { error } = await supabase.from('bucket_list').update({ sub_items: subItems }).eq('id', id)
    if (error) throw error
  },

  deleteBucketItem: async (id) => {
    const { error } = await supabase.from('bucket_list').delete().eq('id', id)
    if (error) throw error
  },

  // --- GALLERY ---
  getGallery: async () => {
    const { data, error } = await supabase.from('gallery').select('*').order('date', { ascending: false })
    if (error) throw error
    return data
  },

  addGalleryMedia: async (date, file) => {
    const cleanName = sanitizeFileName(file.name)
    const filePath = `gallery/${Date.now()}_${cleanName}`
    const { error } = await supabase.storage.from(STORAGE_BUCKET).upload(filePath, file)
    if (error) throw error
    
    const { data: { publicUrl } } = supabase.storage.from(STORAGE_BUCKET).getPublicUrl(filePath)
    const type = file.type.startsWith('video/') ? 'video' : 'image'

    const { data, error: dbError } = await supabase
      .from('gallery')
      .insert([{ date, url: publicUrl, type }])
      .select()
    if (dbError) throw dbError
    return data[0]
  },

  deleteGalleryMedia: async (id) => {
    const { error } = await supabase.from('gallery').delete().eq('id', id)
    if (error) throw error
  }
}
