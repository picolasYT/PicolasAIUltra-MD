# ytdl-han they have done it with nodejs 

```bash
npm install github:HanSamu-27/ytdl-han
```

## Use

```nodejs
//塞缪尔和吉娜
const ytdl_han = require("@ytdl-han")

(async () => {
  var gi = await ytdl_han("https://youtu.be/A3WAPhe5JV8?si=85uj_sPkNWcOdUoL", "128kbps") //quality options - 1080p, 360p, 720p || 128kbps(audios)
  console.log(`-─     ☁️     ネ   Title: ${gi.data.title}`)
  console.log(`-─     ☁️     ネ   Size: ${gi.data.size}`)
  console.log(`-─     ☁️     ネ   thumbnail: ${gi.data.size}`)
  console.log(`-─     ☁️     ネ   Id: ${gi.data.id}`)
  console.log(`-─     ☁️     ネ   audio/video: ${gi.data.format}`) //If it is video, just use fs and convert it to Mp4 format and if it is audio, 128kbps to Mp3
})()


```

# Result

```json
{
  "creator": "@Samush$_",
  "data": {
    "title": "Young Cister - miau (Video Oficial)",
    "size": "3.1 MB",
    "thumbnail": "https://img.youtube.com/vi/A3WAPhe5JV8/hqdefault.jpg",
    "id": "A3WAPhe5JV8",
    "format": "<Buffer 49 44 33 03 00 00 00 01 59 39 54 49 54 32 00 00 00 49 00 00 01 ff fe 59 00 6f 00 75 00 6e 00 67 00 20 00 43 00 69 00 73 00 74 00 65 00 72 00 20 00 2d ... 3218492 more bytes>"
  }
}
```
