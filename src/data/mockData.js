export const vehicles = [
  { id: 1, brand: 'Toyota', model: 'Corolla', year: 2024, category: 'Berline', fuel: 'Essence', transmission: 'Automatique', seats: 5, pricePerDay: 4500, status: 'available', plate: '00125-116-16', mileage: 12400, image: 'https://images.unsplash.com/photo-1623869675781-80aa31012a5a?w=400', color: '#1a1a2e', features: ['GPS', 'Climatisation', 'Bluetooth', 'Caméra de recul'] },
  { id: 2, brand: 'Hyundai', model: 'Tucson', year: 2023, category: 'SUV', fuel: 'Diesel', transmission: 'Automatique', seats: 5, pricePerDay: 6500, status: 'rented', plate: '00456-118-16', mileage: 28900, image: 'https://images.unsplash.com/photo-1633695632011-9b2f1b3a6b14?w=400', color: '#2d3436', features: ['GPS', 'Climatisation', 'Bluetooth', 'Toit ouvrant', '4x4'] },
  { id: 3, brand: 'Renault', model: 'Clio 5', year: 2024, category: 'Citadine', fuel: 'Essence', transmission: 'Manuelle', seats: 5, pricePerDay: 3000, status: 'available', plate: '00789-120-16', mileage: 8200, image: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?w=400', color: '#e74c3c', features: ['Climatisation', 'Bluetooth'] },
  { id: 4, brand: 'Mercedes', model: 'Classe C', year: 2023, category: 'Premium', fuel: 'Diesel', transmission: 'Automatique', seats: 5, pricePerDay: 12000, status: 'available', plate: '01012-122-16', mileage: 15600, image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=400', color: '#0c0c0c', features: ['GPS', 'Climatisation', 'Cuir', 'Bluetooth', 'Caméra 360°', 'Sièges chauffants'] },
  { id: 5, brand: 'Dacia', model: 'Logan', year: 2024, category: 'Économique', fuel: 'Essence', transmission: 'Manuelle', seats: 5, pricePerDay: 2500, status: 'rented', plate: '01345-124-16', mileage: 45200, image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?w=400', color: '#636e72', features: ['Climatisation'] },
  { id: 6, brand: 'Peugeot', model: '3008', year: 2023, category: 'SUV', fuel: 'Diesel', transmission: 'Automatique', seats: 5, pricePerDay: 7000, status: 'maintenance', plate: '01678-126-16', mileage: 34100, image: 'https://images.unsplash.com/photo-1606611013016-969c19ba27b5?w=400', color: '#2c3e50', features: ['GPS', 'Climatisation', 'Bluetooth', 'Aide au stationnement'] },
  { id: 7, brand: 'Volkswagen', model: 'Golf 8', year: 2024, category: 'Berline', fuel: 'Essence', transmission: 'Automatique', seats: 5, pricePerDay: 5500, status: 'available', plate: '01901-128-16', mileage: 11000, image: 'https://images.unsplash.com/photo-1552519507-da3b142c6e3d?w=400', color: '#dfe6e9', features: ['GPS', 'Climatisation', 'Bluetooth', 'Apple CarPlay'] },
  { id: 8, brand: 'Kia', model: 'Sportage', year: 2023, category: 'SUV', fuel: 'Diesel', transmission: 'Automatique', seats: 5, pricePerDay: 6000, status: 'rented', plate: '02234-130-16', mileage: 22300, image: 'https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=400', color: '#e17055', features: ['GPS', 'Climatisation', 'Bluetooth', 'Caméra de recul'] },
  { id: 9, brand: 'Citroën', model: 'C3', year: 2024, category: 'Citadine', fuel: 'Essence', transmission: 'Manuelle', seats: 5, pricePerDay: 2800, status: 'available', plate: '02567-132-16', mileage: 6800, image: 'https://images.unsplash.com/photo-1542362567-b07e54358753?w=400', color: '#fdcb6e', features: ['Climatisation', 'Bluetooth'] },
  { id: 10, brand: 'BMW', model: 'X3', year: 2022, category: 'Premium', fuel: 'Diesel', transmission: 'Automatique', seats: 5, pricePerDay: 11000, status: 'available', plate: '02890-134-16', mileage: 31200, image: 'https://images.unsplash.com/photo-1555215695-3004980ad54e?w=400', color: '#2d3436', features: ['GPS', 'Cuir', 'Climatisation', 'Bluetooth', 'Toit panoramique'] },
];

export const clients = [
  { id: 1, firstName: 'Ahmed', lastName: 'BOUZID', phone: '0555 12 34 56', email: 'ahmed.bouzid@email.com', license: 'B', licenseNumber: '12345678', address: 'Alger Centre', totalRentals: 8, joinedDate: '2024-03-15', status: 'active' },
  { id: 2, firstName: 'Fatima', lastName: 'ZERHOUNI', phone: '0661 98 76 54', email: 'fatima.z@email.com', license: 'B', licenseNumber: '23456789', address: 'Oran', totalRentals: 3, joinedDate: '2024-08-22', status: 'active' },
  { id: 3, firstName: 'Karim', lastName: 'MESSAOUDI', phone: '0770 45 67 89', email: 'k.messaoudi@email.com', license: 'B', licenseNumber: '34567890', address: 'Constantine', totalRentals: 12, joinedDate: '2023-11-10', status: 'active' },
  { id: 4, firstName: 'Yasmine', lastName: 'BENALI', phone: '0555 78 90 12', email: 'yasmine.b@email.com', license: 'B', licenseNumber: '45678901', address: 'Blida', totalRentals: 1, joinedDate: '2025-01-05', status: 'active' },
  { id: 5, firstName: 'Mohamed', lastName: 'CHERIF', phone: '0661 23 45 67', email: 'm.cherif@email.com', license: 'B', licenseNumber: '56789012', address: 'Sétif', totalRentals: 5, joinedDate: '2024-06-18', status: 'inactive' },
  { id: 6, firstName: 'Amina', lastName: 'HADJ', phone: '0770 11 22 33', email: 'amina.hadj@email.com', license: 'B', licenseNumber: '67890123', address: 'Tlemcen', totalRentals: 2, joinedDate: '2025-02-14', status: 'active' },
];

export const reservations = [
  { id: 1, clientId: 1, vehicleId: 2, startDate: '2025-05-10', endDate: '2025-05-17', status: 'active', totalPrice: 45500, paidAmount: 45500, paymentMethod: 'Espèces', deposit: 20000, notes: '' },
  { id: 2, clientId: 3, vehicleId: 5, startDate: '2025-05-12', endDate: '2025-05-14', status: 'active', totalPrice: 5000, paidAmount: 5000, paymentMethod: 'Virement', deposit: 10000, notes: 'Client régulier' },
  { id: 3, clientId: 2, vehicleId: 8, startDate: '2025-05-08', endDate: '2025-05-15', status: 'active', totalPrice: 42000, paidAmount: 30000, paymentMethod: 'Espèces', deposit: 15000, notes: 'Reste à payer: 12000 DA' },
  { id: 4, clientId: 4, vehicleId: 1, startDate: '2025-05-18', endDate: '2025-05-22', status: 'upcoming', totalPrice: 18000, paidAmount: 0, paymentMethod: '', deposit: 0, notes: 'Première location' },
  { id: 5, clientId: 1, vehicleId: 7, startDate: '2025-04-20', endDate: '2025-04-25', status: 'completed', totalPrice: 27500, paidAmount: 27500, paymentMethod: 'Espèces', deposit: 20000, notes: '' },
  { id: 6, clientId: 3, vehicleId: 4, startDate: '2025-04-15', endDate: '2025-04-18', status: 'completed', totalPrice: 36000, paidAmount: 36000, paymentMethod: 'CCP', deposit: 25000, notes: '' },
  { id: 7, clientId: 5, vehicleId: 3, startDate: '2025-05-20', endDate: '2025-05-25', status: 'upcoming', totalPrice: 15000, paidAmount: 7500, paymentMethod: 'Espèces', deposit: 10000, notes: '' },
  { id: 8, clientId: 6, vehicleId: 10, startDate: '2025-05-25', endDate: '2025-05-30', status: 'upcoming', totalPrice: 55000, paidAmount: 0, paymentMethod: '', deposit: 0, notes: '' },
  { id: 9, clientId: 2, vehicleId: 9, startDate: '2025-03-10', endDate: '2025-03-13', status: 'completed', totalPrice: 8400, paidAmount: 8400, paymentMethod: 'Espèces', deposit: 10000, notes: '' },
  { id: 10, clientId: 4, vehicleId: 6, startDate: '2025-04-01', endDate: '2025-04-05', status: 'completed', totalPrice: 28000, paidAmount: 28000, paymentMethod: 'Virement', deposit: 15000, notes: '' },
];

export const returns = [
  { id: 1, reservationId: 5, returnDate: '2025-04-25', mileageOut: 10200, mileageIn: 10850, fuelOut: 'Plein', fuelIn: 'Plein', condition: 'Bon', damages: '', extraCharges: 0, notes: 'RAS' },
  { id: 2, reservationId: 6, returnDate: '2025-04-18', mileageOut: 14800, mileageIn: 15600, fuelOut: 'Plein', fuelIn: '3/4', condition: 'Bon', damages: '', extraCharges: 1500, notes: 'Frais carburant manquant' },
  { id: 3, reservationId: 9, returnDate: '2025-03-13', mileageOut: 6200, mileageIn: 6800, fuelOut: 'Plein', fuelIn: 'Plein', condition: 'Bon', damages: '', extraCharges: 0, notes: '' },
  { id: 4, reservationId: 10, returnDate: '2025-04-05', mileageOut: 32500, mileageIn: 34100, fuelOut: 'Plein', fuelIn: '1/2', condition: 'Dommage mineur', damages: 'Rayure pare-choc avant', extraCharges: 8000, notes: 'Réparation programmée' },
];

export const monthlyRevenue = [
  { month: 'Jan', revenue: 185000, rentals: 14 },
  { month: 'Fév', revenue: 210000, rentals: 16 },
  { month: 'Mar', revenue: 245000, rentals: 19 },
  { month: 'Avr', revenue: 320000, rentals: 24 },
  { month: 'Mai', revenue: 198000, rentals: 15 },
];

export const categoryStats = [
  { name: 'SUV', value: 35, color: '#f59e0b' },
  { name: 'Berline', value: 25, color: '#3b82f6' },
  { name: 'Citadine', value: 20, color: '#10b981' },
  { name: 'Premium', value: 15, color: '#8b5cf6' },
  { name: 'Économique', value: 5, color: '#6b7280' },
];
