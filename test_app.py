import unittest
import json
from app import app

class CarbonFlowTestCase(unittest.TestCase):
    def setUp(self):
        self.app = app.test_client()
        self.app.testing = True

    def test_index_route(self):
        response = self.app.get('/')
        self.assertEqual(response.status_code, 200)

    def test_calculate_endpoint(self):
        payload = {
            'travelType': 'petrol_car',
            'travelKm': 100,
            'flightHours': 2,
            'electricityKwh': 300,
            'acHours': 10,
            'gasKwh': 50,
            'dietType': 'balanced',
            'shoppingLevel': 'medium',
            'wasteType': 'moderate'
        }
        response = self.app.post('/api/calculate', 
                                 data=json.dumps(payload), 
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        
        self.assertIn('total_kg', data)
        self.assertIn('total_tonnes', data)
        self.assertIn('breakdown', data)
        self.assertIn('rating', data)
        self.assertIn('grade', data)

    def test_scan_bill_endpoint(self):
        payload = {'fileName': 'test_bill.png'}
        response = self.app.post('/api/scan-bill', data=payload)
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertTrue(data['success'])
        self.assertIn('extracted_kwh', data)
        self.assertIn('estimated_monthly_co2_kg', data)

    def test_chatbot_endpoint(self):
        payload = {'message': 'How can I save energy at home?'}
        response = self.app.post('/api/chatbot', 
                                 data=json.dumps(payload), 
                                 content_type='application/json')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('reply', data)
        self.assertTrue(len(data['reply']) > 0)

    def test_leaderboard_endpoint(self):
        response = self.app.get('/api/leaderboard')
        self.assertEqual(response.status_code, 200)
        data = json.loads(response.data)
        self.assertIn('office', data)
        self.assertIn('school', data)
        self.assertIn('personal', data)

if __name__ == '__main__':
    unittest.main()
