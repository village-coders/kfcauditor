/**
 * Auditor accounts and assigned stores matching kfcauditor.hfa-portals.com.
 */

export const MOCK_AUDITORS = {
  taoheed: {
    username: 'Taoheed',
    fullName: 'Taoheed',
    role: 'HFA KFC Lead Auditor',
    userToken: 'GnCW8vdpX3c=',
    franchiseeId: '20046',
    franchiseeName: 'Test',
    assignedStores: [
      {
        id: '40288',
        name: 'Ibadan',
        shortName: 'Ibadan',
        code: '40288',
        address: 'Ibadan KFC Restaurant',
        franchiseeId: '20046',
        franchiseeName: 'Test',
        region: 'Oyo State'
      },
      {
        id: '40289',
        name: 'Lagos',
        shortName: 'Lagos',
        code: '40289',
        address: 'Lagos KFC Restaurant',
        franchiseeId: '20046',
        franchiseeName: 'Test',
        region: 'Lagos State'
      }
    ]
  },
  amina: {
    username: 'Amina',
    fullName: 'Amina Bello',
    role: 'Senior Food Safety Auditor',
    userToken: 'AmB89KfcHfa=',
    franchiseeId: '23',
    franchiseeName: 'Jivraj Group',
    assignedStores: [
      {
        id: '40301',
        name: 'Lagos - Ikeja',
        shortName: 'Lagos - Ikeja',
        code: '40301',
        address: 'Ikeja City Mall, Obafemi Awolowo Way',
        franchiseeId: '23',
        franchiseeName: 'Jivraj Group',
        region: 'Lagos State'
      },
      {
        id: '40302',
        name: 'Lagos - Victoria Island',
        shortName: 'Lagos - VI',
        code: '40302',
        address: 'Adeola Odeku Street, Victoria Island',
        franchiseeId: '23',
        franchiseeName: 'Jivraj Group',
        region: 'Lagos State'
      }
    ]
  },
  david: {
    username: 'David',
    fullName: 'David Adeleke',
    role: 'HFA Compliance Auditor',
    userToken: 'DvAd77Hfa=',
    franchiseeId: '31',
    franchiseeName: 'Soul Foods Group',
    assignedStores: [
      {
        id: '40401',
        name: 'Abuja - Wuse II',
        shortName: 'Abuja - Wuse',
        code: '40401',
        address: 'Aminu Kano Crescent, Wuse II, Abuja',
        franchiseeId: '31',
        franchiseeName: 'Soul Foods Group',
        region: 'FCT Abuja'
      }
    ]
  }
};

export const QUICK_DEMO_USERS = [
  { username: 'Taoheed', storeDefault: 'Ibadan' },
  { username: 'Amina', storeDefault: 'Lagos - Ikeja' },
  { username: 'David', storeDefault: 'Abuja - Wuse' }
];

