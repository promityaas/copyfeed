import pathlib,zipfile
root=pathlib.Path(__file__).resolve().parent.parent
out=root/'dist'/'copyfeed-v0.16.0-source.zip'
excluded={'.git','node_modules','dist','downloads','artifacts','__pycache__'}
with zipfile.ZipFile(out,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  rel=p.relative_to(root)
  if any(x in excluded for x in rel.parts) or not p.is_file():continue
  info=zipfile.ZipInfo('copyfeed/'+rel.as_posix(),(2026,1,1,0,0,0));info.compress_type=zipfile.ZIP_DEFLATED
  z.writestr(info,p.read_bytes())
print(out)
