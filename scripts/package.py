import sys,pathlib,zipfile
root=pathlib.Path(sys.argv[1])
with zipfile.ZipFile(sys.argv[2],'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(root.rglob('*')):
  if p.is_file():
   info=zipfile.ZipInfo(p.relative_to(root).as_posix(),(2026,1,1,0,0,0)); info.compress_type=zipfile.ZIP_DEFLATED
   z.writestr(info,p.read_bytes())
