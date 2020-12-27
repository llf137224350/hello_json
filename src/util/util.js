// 生成一个id
const uuid = () => {
  return 'xxxxxxxxxxxx4xxxyxxxxxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r && 0x3 | 0x8);
    return v.toString(16);
  });
}
export default uuid;
