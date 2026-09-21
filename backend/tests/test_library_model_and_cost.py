import unittest

def calculate_image_cost(model_name, has_vision_references=False, usd_rate=5.0):
    base_costs = {
        'gpt-image-1': 0.040,
        'dall-e-3': 0.040,
        'gpt-image-1-mini': 0.020,
        'dall-e-2': 0.020,
        'gpt-image-2': 0.050
    }
    cost_usd = base_costs.get(model_name, 0.040)
    if has_vision_references:
        cost_usd += 0.005
    
    cost_brl = round(cost_usd * usd_rate, 2)
    formatted = f"R$ {cost_brl:.2f}".replace('.', ',')
    return {
        'model': model_name,
        'cost_usd': cost_usd,
        'cost_brl': cost_brl,
        'formatted': formatted
    }

class TestLibraryModelAndCost(unittest.TestCase):
    def test_cost_calculation_gpt_image_1(self):
        result = calculate_image_cost('gpt-image-1', has_vision_references=False, usd_rate=5.0)
        self.assertEqual(result['cost_usd'], 0.040)
        self.assertEqual(result['cost_brl'], 0.20)
        self.assertEqual(result['formatted'], 'R$ 0,20')

    def test_cost_calculation_with_vision_references(self):
        result = calculate_image_cost('gpt-image-1', has_vision_references=True, usd_rate=5.0)
        self.assertEqual(result['cost_usd'], 0.045)
        self.assertEqual(result['cost_brl'], 0.22)
        self.assertEqual(result['formatted'], 'R$ 0,22')

    def test_cost_calculation_mini_model(self):
        result = calculate_image_cost('gpt-image-1-mini', has_vision_references=False, usd_rate=5.0)
        self.assertEqual(result['cost_usd'], 0.020)
        self.assertEqual(result['cost_brl'], 0.10)
        self.assertEqual(result['formatted'], 'R$ 0,10')

if __name__ == '__main__':
    unittest.main()
