export interface Transfer {
  id: string
  token: string
  created_at: string
  expires_at: string
  password_hash: string | null
  max_downloads: number | null
  download_count: number
  message: string | null
  sender_email: string | null
  total_size: number
}

export interface TransferFile {
  id: string
  transfer_id: string
  filename: string
  size: number
  mime_type: string
  storage_path: string
  created_at: string
}

export interface TransferWithFiles extends Transfer {
  files: TransferFile[]
}

export interface UploadConfig {
  expiry: string | number
  maxDownloads: number | null
  password: string
  message: string
  senderEmail: string
}
