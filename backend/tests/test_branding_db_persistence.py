"""
Teste unitário para a persistência de Branding no banco de dados (DB-First).
"""
import unittest
from pathlib import Path


class TestBrandingDbPersistence(unittest.TestCase):
    def setUp(self):
        self.services_path = (
            Path(__file__).resolve().parents[2] / "backend" / "dashboard" / "routes" / "services.js"
        )
        self.assertTrue(self.services_path.exists(), f"services.js não encontrado em {self.services_path}")
        with open(self.services_path, encoding="utf-8") as f:
            self.services_content = f.read()

        self.carousels_path = (
            Path(__file__).resolve().parents[2] / "backend" / "dashboard" / "routes" / "carousels.js"
        )
        with open(self.carousels_path, encoding="utf-8") as f:
            self.carousels_content = f.read()

    def test_read_branding_queries_db(self):
        """Verifica se a leitura do branding consulta a tabela branding no PostgreSQL."""
        self.assertIn("SELECT data FROM branding WHERE id = 1", self.services_content, "Consulta ao DB em readBranding não encontrada.")

    def test_write_branding_upserts_db(self):
        """Verifica se o salvamento do branding executa INSERT/UPDATE na tabela branding."""
        self.assertIn("INSERT INTO branding", self.services_content, "Comando de upsert na tabela branding não encontrado.")
        self.assertIn("ON CONFLICT (id) DO UPDATE", self.services_content, "Upsert de resolução de conflito de ID em branding não encontrado.")

    def test_carousels_mock_reads_branding_from_db(self):
        """Verifica se carousels.js busca branding no DB antes do arquivo local."""
        self.assertIn("SELECT data FROM branding WHERE id = 1", self.carousels_content, "Leitura de branding no DB em carousels.js não encontrada.")

if __name__ == "__main__":
    unittest.main(verbosity=2)
