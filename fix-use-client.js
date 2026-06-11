const fs = require('fs');
const files = [
  'app/admin/events/page.tsx',
  'app/admin/mahasiswa/page.tsx',
  'app/mahasiswa/dashboard/page.tsx',
  'app/mahasiswa/diskusi/page.tsx',
  'app/mahasiswa/katalog/page.tsx',
  'app/mahasiswa/katalog/[id]/page.tsx',
  'app/mahasiswa/profil/page.tsx',
  'app/mahasiswa/tiket/page.tsx',
  'app/mahasiswa/transaksi/page.tsx',
  'app/organizer/diskusi/page.tsx',
  'app/organizer/events/adson/[id]/page.tsx',
  'app/organizer/events/edit/[id]/page.tsx',
  'app/organizer/events/page.tsx',
  'app/organizer/events/sertifikat/[id]/page.tsx',
  'app/organizer/pendaftar/page.tsx',
  'app/page.tsx',
  'components/DashboardLayout.tsx',
  'components/MahasiswaLayout.tsx'
];
files.forEach(f => {
  let content = fs.readFileSync(f, 'utf8');
  let lines = content.split('\n');
  let useClientIndex = -1;
  for(let i=0; i<lines.length; i++) {
    if (lines[i].includes('"use client"') || lines[i].includes("'use client'")) {
      useClientIndex = i;
      break;
    }
  }
  if (useClientIndex > 0) {
    const useClientLine = lines.splice(useClientIndex, 1)[0];
    lines.unshift(useClientLine);
    fs.writeFileSync(f, lines.join('\n'), 'utf8');
    console.log('Fixed use client in:', f);
  }
});
