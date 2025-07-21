import bcrypt from "bcrypt";

async function hashPassword(plainPassword: string) {
  const saltRounds = 7;
  const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
  return hashedPassword;
}

async function comparePassword(plainPassword: string, hashedPassword: string) {
  const isMatch = await bcrypt.compare(plainPassword, hashedPassword);
  return isMatch;
}


export { hashPassword, comparePassword };