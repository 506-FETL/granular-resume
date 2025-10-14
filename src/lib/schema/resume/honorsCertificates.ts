import { z } from 'zod'

// 预设荣誉证书
export const PRESET_CERTIFICATES = [
  '英语四级',
  '英语六级',
  '计算机一级',
  '计算机二级',
  '计算机三级',
  '计算机四级',
  '普通话一级',
  '普通话二级',
  '王者荣耀春季赛10强',
  '10大肖年领军人才',
] as const

export type PresetCertificate = (typeof PRESET_CERTIFICATES)[number]

// 证书项 schema - 简单的对象包含 name 字段
export const certificateItemSchema = z.object({
  name: z.string().trim().min(1, '证书名称不能为空'),
})

// 荣誉证书列表
const certificatesListSchema = z.array(certificateItemSchema).default([])

const honorsCertificatesBaseSchema = z.object({
  description: z.string().trim().default(''),
  certificates: certificatesListSchema,
})

export const honorsCertificatesFormSchema = honorsCertificatesBaseSchema.extend({
  isHidden: z.boolean().default(false),
})

export const honorsCertificatesFormSchemaExcludeHidden = honorsCertificatesBaseSchema

export type HonorsCertificatesForm = z.infer<typeof honorsCertificatesFormSchema>
export type HonorsCertificatesFormExcludeHidden = z.infer<typeof honorsCertificatesFormSchemaExcludeHidden>
export type CertificateItem = z.infer<typeof certificateItemSchema>

export const DEFAULT_HONORS_CERTIFICATES: HonorsCertificatesForm = {
  description: '',
  certificates: [],
  isHidden: false,
}
