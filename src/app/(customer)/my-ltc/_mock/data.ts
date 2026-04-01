export const customerMockData = {
    customer: {
        fullName: 'Nguyễn Văn An',
        phone: '0901234567',
        city: 'Hồ Chí Minh',
        district: 'Quận 1',
        address: '123 Nguyễn Huệ, Phường Bến Nghé',
        gender: 'Nam',
        dob: '15/03/1995',
        email: 'nguyenvanan@gmail.com',
        memberId: '1234 5678 9012 3456',
        totalSpent: '3,500',
        currentPoints: '1,250',
        memberLevel: 'Member',
        qrData: '1234567890123456',
        validThru: '01/01/2028',
        voucherCount: 1
    },
    transactions: [
        {
            id: 'TH-001',
            date: '28/03/2026',
            description: 'Mua vé STRAY KIDS: DOMINATE x2 - LTC Vincom HP',
            amount: '160.000đ',
            type: 'Vé xem phim',
            time: '14:30',
            points: '+150'
        },
        {
            id: 'TH-002',
            date: '28/03/2026',
            description: 'Combo Bắp Nước L',
            amount: '89.000đ',
            type: 'Mua bắp nước',
            time: '14:35',
            points: '+50'
        },
        {
            id: 'TH-003',
            date: '15/03/2026',
            description: 'Đổi voucher',
            amount: '0đ',
            type: 'Đổi voucher',
            time: '10:00',
            points: '-500'
        },
        {
            id: 'TH-004',
            date: '10/03/2026',
            description: 'Mua vé HẸN EM NGÀY NHẬT THỰC x1',
            amount: '80.000đ',
            type: 'Vé xem phim',
            time: '19:00',
            points: '+200'
        }
    ],
    pointHistory: [
        {
            id: 'TXN-001',
            type: 'Mua vé',
            points: '+150',
            date: '28/03/2026',
            time: '14:30'
        },
        {
            id: 'TXN-002',
            type: 'Mua bắp nước',
            points: '+50',
            date: '28/03/2026',
            time: '14:35'
        },
        {
            id: 'TXN-003',
            type: 'Đổi voucher',
            points: '-500',
            date: '15/03/2026',
            time: '10:00'
        },
        {
            id: 'TXN-004',
            type: 'Mua vé',
            points: '+200',
            date: '10/03/2026',
            time: '19:00'
        }
    ],
    tierBenefits: [
        {
            tier: 'Member',
            minPoints: 0,
            discount: '0%',
            multiplier: '1x'
        },
        {
            tier: 'Silver',
            minPoints: 2000,
            discount: '5%',
            multiplier: '1.2x'
        },
        {
            tier: 'Gold',
            minPoints: 5000,
            discount: '10%',
            multiplier: '1.5x'
        },
        {
            tier: 'Platinum',
            minPoints: 10000,
            discount: '15%',
            multiplier: '2x'
        },
        {
            tier: 'Diamond',
            minPoints: 20000,
            discount: '20%',
            multiplier: '3x'
        }
    ],
    membershipNotes: [
        'Mỗi 1,000đ chi tiêu tương ứng 1 điểm cơ bản.',
        'Điểm cộng thêm được áp dụng theo hệ số nhân điểm của từng hạng.',
        'Hệ thống xét hạng định kỳ dựa trên tổng điểm tích lũy.'
    ],
    vouchers: [
        {
            code: 'LTC-WELCOME',
            description: 'Giảm 20% cho vé phim đầu tiên',
            expiry: '30/06/2026',
            discount: '20%',
            status: 'Có thể dùng'
        },
        {
            code: 'LTC-BIRTHDAY',
            description: 'Miễn phí 1 vé phim nhân dịp sinh nhật',
            expiry: '31/03/2026',
            discount: '100%',
            status: 'Hết hạn'
        }
    ]
};
