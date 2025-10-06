function getAge(age: string | undefined) {
  if (!age)
    return ''

  const now = new Date()
  const birth = new Date(age)

  return now.getFullYear() - birth.getFullYear()
    - (now.getMonth() < birth.getMonth() || (now.getMonth() === birth.getMonth() && now.getDate() < birth.getDate()) ? 1 : 0)
}

export default getAge
