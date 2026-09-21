import unittest
from pathlib import Path
import re

class TestB2S3Resilience(unittest.TestCase):
    def test_endpoint_and_region_regex(self):
        # Validação do algoritmo de extração de região de endpoints B2/AWS
        def extract_region(ep):
            match = re.search(r's3[.-]([a-z0-9-]+)\.backblazeb2\.com', ep, re.IGNORECASE)
            if match: return match.group(1)
            aws_match = re.search(r's3[.-]([a-z0-9-]+)\.amazonaws\.com', ep, re.IGNORECASE)
            if aws_match: return aws_match.group(1)
            return 'us-east-1'

        self.assertEqual(extract_region('https://s3.us-east-005.backblazeb2.com'), 'us-east-005')
        self.assertEqual(extract_region('s3.us-west-004.backblazeb2.com'), 'us-west-004')
        self.assertEqual(extract_region('https://s3.eu-central-003.backblazeb2.com'), 'eu-central-003')
        self.assertEqual(extract_region('https://s3.sa-east-1.amazonaws.com'), 'sa-east-1')
        self.assertEqual(extract_region('http://localhost:9000'), 'us-east-1')

    def test_endpoint_normalization(self):
        # Validação da normalização de URLs (evitando HTTP 301 Moved Permanently)
        def normalize_endpoint(raw):
            if not raw: return 'http://localhost:9000'
            ep = raw.strip()
            if not ep.startswith('http://') and not ep.startswith('https://'):
                if any(h in ep for h in ['localhost', 'minio', '127.0.0.1', ':9000']):
                    ep = f'http://{ep}'
                else:
                    ep = f'https://{ep}'
            elif ep.startswith('http://') and any(c in ep for c in ['backblazeb2.com', 'amazonaws.com', 'r2.cloudflarestorage.com']):
                ep = ep.replace('http://', 'https://')
            return ep.rstrip('/')

        self.assertEqual(normalize_endpoint('s3.us-east-005.backblazeb2.com'), 'https://s3.us-east-005.backblazeb2.com')
        self.assertEqual(normalize_endpoint('http://s3.us-east-005.backblazeb2.com/'), 'https://s3.us-east-005.backblazeb2.com')
        self.assertEqual(normalize_endpoint('minio:9000'), 'http://minio:9000')
        self.assertEqual(normalize_endpoint('http://localhost:9000/'), 'http://localhost:9000')

    def test_b2_js_has_safe_handling(self):
        b2_file = Path(__file__).resolve().parents[1] / 'dashboard' / 'b2.js'
        self.assertTrue(b2_file.exists())
        content = b2_file.read_text(encoding='utf-8')
        self.assertIn('normalizeEndpoint', content)
        self.assertIn('getRegionFromEndpoint', content)
        self.assertIn('isCloudProvider', content)

if __name__ == '__main__':
    unittest.main()
