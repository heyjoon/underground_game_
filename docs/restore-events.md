# Restore Event Data

`data/random_events.json.gz.b64` contains the updated `data/random_events.json` compressed with gzip and encoded as Base64.

To restore it:

```powershell
node -e "const fs=require('fs'); const z=require('zlib'); const b=fs.readFileSync('data/random_events.json.gz.b64','utf8'); fs.writeFileSync('data/random_events.json', z.gunzipSync(Buffer.from(b,'base64')))"
```

Then run:

```powershell
node tools/smoke_web_routes.js
```
