// Test GeoTIFF creation and multipart upload
import fs from 'fs';

console.log('Testing GeoTIFF upload to /api/v1/analyze-image...');

const fileBuffer = fs.readFileSync('sample_sat_tile.tif');
const blob = new Blob([fileBuffer], { type: 'image/tiff' });

const form = new FormData();
form.append('image', blob, 'sample_sat_tile.tif');
form.append('query', 'Find all buildings in this satellite tile');
form.append('language', 'en');

const res = await fetch('http://localhost:5000/api/v1/analyze-image', {
  method: 'POST',
  body: form
});

const data = await res.json();
console.log('TIFF Upload Status:', data.status);
console.log('Extracted Metadata:', JSON.stringify(data.metadata, null, 2));
console.log('Answer:', data.answer);
console.log('Provenance:', data.provenance.activeModels);

// Clean up
if (fs.existsSync('sample_sat_tile.tif')) fs.unlinkSync('sample_sat_tile.tif');

if (data.status === 'SUCCESS' && data.metadata.fileType.includes('TIFF')) {
  console.log('✅ GeoTIFF upload and inspection verified successfully!');
} else {
  throw new Error('TIFF upload failed');
}
