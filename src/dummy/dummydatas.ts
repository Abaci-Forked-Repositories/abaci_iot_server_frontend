export const dummyVehicleData = [
    {
      id: 1,
      chassis_no: "CHS123456789",
      vehicle_no: "ABC123",
      rfid_card: "RFID001",
      vehicle_type: "Truck",
      vehicle_tank_capacity: "5000",
      created_by: "John Doe",
      created_date: "2024-03-15T10:30:00",
      modified_by_name: "Jane Smith",
      modified_date: "2024-03-16T14:20:00",
      status: "Active",
      random_key: "key123"
    },
    {
      id: 2,
      chassis_no: "CHS987654321",
      vehicle_no: "XYZ789",
      rfid_card: "RFID002",
      vehicle_type: "Van",
      vehicle_tank_capacity: "3000",
      created_by: "Mike Johnson",
      created_date: "2024-03-14T09:15:00",
      modified_by_name: "Sarah Wilson",
      modified_date: "2024-03-15T11:45:00",
      status: "Approval Pending",
      random_key: "key456"
    },
    {
      id: 3,
      chassis_no: "CHS456789123",
      vehicle_no: "DEF456",
      rfid_card: "RFID003",
      vehicle_type: "Car",
      vehicle_tank_capacity: "2000",
      created_by: "Emily Brown",
      created_date: "2024-03-13T16:20:00",
      modified_by_name: "David Lee",
      modified_date: "2024-03-14T13:10:00",
      status: "Disabled",
      random_key: "key789"
    },
    {
      id: 4,
      chassis_no: "CHS789123456",
      vehicle_no: "GHI789",
      rfid_card: "RFID004",
      vehicle_type: "Bus",
      vehicle_tank_capacity: "8000",
      created_by: "Robert Taylor",
      created_date: "2024-03-12T08:45:00",
      modified_by_name: "Lisa Anderson",
      modified_date: "2024-03-13T15:30:00",
      status: "Rejected",
      random_key: "key012"
    },
    {
      id: 5,
      chassis_no: "CHS321654987",
      vehicle_no: "JKL012",
      rfid_card: "RFID005",
      vehicle_type: "Truck",
      vehicle_tank_capacity: "6000",
      created_by: "William Clark",
      created_date: "2024-03-11T11:20:00",
      modified_by_name: "Mary White",
      modified_date: "2024-03-12T09:40:00",
      status: "Active",
      random_key: "key345"
    }
  ];

export const dummyDriverData = [
  {
    id: "DRV001",
    username: "john.doe",
    license_no: "DL123456",
    name: "John Doe",
    contact_number: "+971501234567",
    assigned_vehicle_no: "ABC123",
    emirate: "EID123456789",
    user_type: "Regular",
    created_by: "Admin User",
    created_date: "2024-03-15T10:00:00",
    modified_by_name: "System Admin",
    modified_date: "2024-03-16T15:30:00",
    user_status: "Active",
    assigned_vehicle: {
      id: "VEH001",
      vehicle_no: "ABC123"
    },
    modified_by: {
      full_name: "System Admin"
    },
    inviter: {
      full_name: "Admin User"
    },
    invited_date: "2024-03-15T10:00:00"
  },
  {
    id: "DRV002",
    username: "jane.smith",
    license_no: "DL789012",
    name: "Jane Smith",
    contact_number: "+971502345678",
    assigned_vehicle_no: "XYZ789",
    emirate: "EID987654321",
    user_type: "Premium",
    created_by: "Manager User",
    created_date: "2024-03-14T09:00:00",
    modified_by_name: "Manager User",
    modified_date: "2024-03-15T11:20:00",
    user_status: "Active",
    assigned_vehicle: {
      id: "VEH002",
      vehicle_no: "XYZ789"
    },
    modified_by: {
      full_name: "Manager User"
    },
    inviter: {
      full_name: "Manager User"
    },
    invited_date: "2024-03-14T09:00:00"
  },
  {
    id: "DRV003",
    username: "mike.wilson",
    license_no: "DL345678",
    name: "Mike Wilson",
    contact_number: "+971503456789",
    assigned_vehicle_no: "Not Assigned",
    emirate: "EID456789123",
    user_type: "Regular",
    created_by: "Admin User",
    created_date: "2024-03-13T14:00:00",
    modified_by_name: "System Admin",
    modified_date: "2024-03-14T16:45:00",
    user_status: "Disabled",
    assigned_vehicle: null,
    modified_by: {
      full_name: "System Admin"
    },
    inviter: {
      full_name: "Admin User"
    },
    invited_date: "2024-03-13T14:00:00"
  },
  {
    id: "DRV004",
    username: "sarah.jones",
    license_no: "DL901234",
    name: "Sarah Jones",
    contact_number: "+971504567890",
    assigned_vehicle_no: "DEF456",
    emirate: "EID789123456",
    user_type: "Premium",
    created_by: "Manager User",
    created_date: "2024-03-12T11:00:00",
    modified_by_name: "Manager User",
    modified_date: "2024-03-13T13:15:00",
    user_status: "Active",
    assigned_vehicle: {
      id: "VEH003",
      vehicle_no: "DEF456"
    },
    modified_by: {
      full_name: "Manager User"
    },
    inviter: {
      full_name: "Manager User"
    },
    invited_date: "2024-03-12T11:00:00"
  },
  {
    id: "DRV005",
    username: "david.brown",
    license_no: "DL567890",
    name: "David Brown",
    contact_number: "+971505678901",
    assigned_vehicle_no: "GHI789",
    emirate: "EID321654987",
    user_type: "Regular",
    created_by: "Admin User",
    created_date: "2024-03-11T16:00:00",
    modified_by_name: "System Admin",
    modified_date: "2024-03-12T10:30:00",
    user_status: "Deleted",
    assigned_vehicle: {
      id: "VEH004",
      vehicle_no: "GHI789"
    },
    modified_by: {
      full_name: "System Admin"
    },
    inviter: {
      full_name: "Admin User"
    },
    invited_date: "2024-03-11T16:00:00"
  }
];

export const dummyPaymentData = [
  {
    id: 1,
    txn_no: "TXN-2024-001",
    amount: 1500.00,
    payment_date: "2024-03-15T10:30:00Z",
    mode_of_payment: {
      id: 1,
      mode_of_payment: "Bank Transfer"
    },
    mode_of_payment__name: "Bank Transfer",
    payment_type: "Credit",
    previous_balance: 5000.00,
    new_balance: 6500.00,
    reference_no: "REF-2024-001",
    created_by: {
      id: 1,
      full_name: "John Doe"
    },
    created_by__name: "John Doe",
    status: "Approved",
    payment_file: "https://example.com/payment_files/payment1.pdf",
    checkout: {
      id: "CHK-001",
      status: "Success",
      type_of_payment: "Bank"
    },
    is_invoice_posted_to_sap: false,
    is_collection_posted_to_sap: false,
    is_outgoing_payment_posted_to_sap: false,
    invoice_posted_to_sap_response: null,
    collection_posted_to_sap_response: null,
    outgoing_payment_posted_to_sap_response: null,
    cb_delivery_status_update_response_code: "000"
  },
  {
    id: 2,
    txn_no: "TXN-2024-002",
    amount: 2500.00,
    payment_date: "2024-03-14T14:45:00Z",
    mode_of_payment: {
      id: 2,
      mode_of_payment: "Cash"
    },
    mode_of_payment__name: "Cash",
    payment_type: "Debit",
    previous_balance: 7500.00,
    new_balance: 5000.00,
    reference_no: "REF-2024-002",
    created_by: {
      id: 2,
      full_name: "Jane Smith"
    },
    created_by__name: "Jane Smith",
    status: "Pending",
    payment_file: null,
    checkout: {
      id: "CHK-002",
      status: "Pending",
      type_of_payment: "Cash"
    },
    is_invoice_posted_to_sap: true,
    is_collection_posted_to_sap: false,
    is_outgoing_payment_posted_to_sap: false,
    invoice_posted_to_sap_response: { status: "success", message: "Posted successfully" },
    collection_posted_to_sap_response: null,
    outgoing_payment_posted_to_sap_response: null,
    cb_delivery_status_update_response_code: null
  },
  {
    id: 3,
    txn_no: "TXN-2024-003",
    amount: 3000.00,
    payment_date: "2024-03-13T09:15:00Z",
    mode_of_payment: {
      id: 3,
      mode_of_payment: "Credit Card"
    },
    mode_of_payment__name: "Credit Card",
    payment_type: "Credit",
    previous_balance: 4500.00,
    new_balance: 7500.00,
    reference_no: "REF-2024-003",
    created_by: {
      id: 3,
      full_name: "Mike Johnson"
    },
    created_by__name: "Mike Johnson",
    status: "Canceled",
    payment_file: "https://example.com/payment_files/payment3.pdf",
    checkout: {
      id: "CHK-003",
      status: "Failed",
      type_of_payment: "Card"
    },
    is_invoice_posted_to_sap: false,
    is_collection_posted_to_sap: false,
    is_outgoing_payment_posted_to_sap: false,
    invoice_posted_to_sap_response: null,
    collection_posted_to_sap_response: null,
    outgoing_payment_posted_to_sap_response: null,
    cb_delivery_status_update_response_code: null
  },
  {
    id: 4,
    txn_no: "TXN-2024-004",
    amount: 1800.00,
    payment_date: "2024-03-12T16:20:00Z",
    mode_of_payment: {
      id: 1,
      mode_of_payment: "Bank Transfer"
    },
    mode_of_payment__name: "Bank Transfer",
    payment_type: "Credit",
    previous_balance: 6000.00,
    new_balance: 7800.00,
    reference_no: "REF-2024-004",
    created_by: {
      id: 4,
      full_name: "Sarah Wilson"
    },
    created_by__name: "Sarah Wilson",
    status: "Approved",
    payment_file: "https://example.com/payment_files/payment4.pdf",
    checkout: {
      id: "CHK-004",
      status: "Success",
      type_of_payment: "Bank"
    },
    is_invoice_posted_to_sap: true,
    is_collection_posted_to_sap: true,
    is_outgoing_payment_posted_to_sap: false,
    invoice_posted_to_sap_response: { status: "success", message: "Posted successfully" },
    collection_posted_to_sap_response: { status: "success", message: "Posted successfully" },
    outgoing_payment_posted_to_sap_response: null,
    cb_delivery_status_update_response_code: "000"
  },
  {
    id: 5,
    txn_no: "TXN-2024-005",
    amount: 4200.00,
    payment_date: "2024-03-11T11:10:00Z",
    mode_of_payment: {
      id: 3,
      mode_of_payment: "Credit Card"
    },
    mode_of_payment__name: "Credit Card",
    payment_type: "Debit",
    previous_balance: 9000.00,
    new_balance: 4800.00,
    reference_no: "REF-2024-005",
    created_by: {
      id: 5,
      full_name: "David Brown"
    },
    created_by__name: "David Brown",
    status: "Approved",
    payment_file: null,
    checkout: {
      id: "CHK-005",
      status: "Success",
      type_of_payment: "Card"
    },
    is_invoice_posted_to_sap: false,
    is_collection_posted_to_sap: false,
    is_outgoing_payment_posted_to_sap: true,
    invoice_posted_to_sap_response: null,
    collection_posted_to_sap_response: null,
    outgoing_payment_posted_to_sap_response: { status: "success", message: "Posted successfully" },
    cb_delivery_status_update_response_code: null
  }
];

export const dummyDischargeData = [
  {
    sr_no: 1,
    foodwatch_srid: "FW-001",
    entity_no: "ENT-001",
    entity_name: "Restaurant A",
    entity_foodwatch_id: "EFW-001",
    entity_trade_license_no: "TL-001",
    grease_trap_count: 2,
    area: "Downtown",
    sub_area: "Central",
    category: "Restaurant",
    sub_category: "Fine Dining",
    zone: "Zone 1",
    grease_trap_label: "GT-001",
    trap_type: "Standard",
    total_gallon_collected: 150,
    vehicle_no: "VH-001",
    txn_id: "TXN-001",
    created_date: "2024-03-15T10:00:00",
    collection_completion_time: "2024-03-15T11:30:00",
    discharge_time: "2024-03-15T12:00:00",
    initiator: "John Doe",
    entity: "ENT-001"
  },
  {
    sr_no: 2,
    foodwatch_srid: "FW-002",
    entity_no: "ENT-002",
    entity_name: "Cafe B",
    entity_foodwatch_id: "EFW-002",
    entity_trade_license_no: "TL-002",
    grease_trap_count: 1,
    area: "Uptown",
    sub_area: "North",
    category: "Cafe",
    sub_category: "Coffee Shop",
    zone: "Zone 2",
    grease_trap_label: "GT-002",
    trap_type: "Compact",
    total_gallon_collected: 75,
    vehicle_no: "VH-002",
    txn_id: "TXN-002",
    created_date: "2024-03-14T09:00:00",
    collection_completion_time: "2024-03-14T10:15:00",
    discharge_time: "2024-03-14T10:45:00",
    initiator: "Jane Smith",
    entity: "ENT-002"
  },
  {
    sr_no: 3,
    foodwatch_srid: "FW-003",
    entity_no: "ENT-003",
    entity_name: "Hotel C",
    entity_foodwatch_id: "EFW-003",
    entity_trade_license_no: "TL-003",
    grease_trap_count: 3,
    area: "Beachside",
    sub_area: "South",
    category: "Hotel",
    sub_category: "Luxury",
    zone: "Zone 3",
    grease_trap_label: "GT-003",
    trap_type: "Large",
    total_gallon_collected: 300,
    vehicle_no: "VH-003",
    txn_id: "TXN-003",
    created_date: "2024-03-13T08:00:00",
    collection_completion_time: "2024-03-13T09:45:00",
    discharge_time: "2024-03-13T10:30:00",
    initiator: "Mike Johnson",
    entity: "ENT-003"
  }
];

export const dummyData = [
  {
    id: 1,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT001",
    establishment_name: "Sunset Restaurant",
    trade_license_no: "TL123456",
    trade_license_name: "Sunset Food Services LLC",
    trade_license_expiry: "2024-12-31",
    office_email: "info@sunsetrestaurant.com",
    address: "123 Business Bay, Dubai",
    phone_no: "+971 4 123 4567",
    entity_location: "Business Bay",
    po_box: "12345",
    makhani_no: "MK123456",
    no_of_hours: 24,
    no_of_rooms: 5,
    no_of_kitchens: 2,
    meals_per_day: 1000,
    seating_capacity: 200,
    gps_coordinates: "25.2048, 55.2708",
    google_location: "Business Bay, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC001",
    foodwatch_id: "FW001",
    foodwatch_business_id: "FB001",
    subarea__area__area: "Downtown",
    subarea__sub_area: "Business Bay",
    subarea__area__zone__zone_name: "Zone 1",
    sub_category__main_category__main_category: "Restaurant",
    sub_category__sub_category: "Fine Dining",
    active_contact_person__full_name: "John Smith",
    active_contact_person__email: "john@sunsetrestaurant.com",
    active_contact_person__contact_number: "+971 50 123 4567",
    inspection_status: "Passed",
    last_inspected_date: "2024-03-15T10:00:00",
    last_inspected_by__full_name: "Ahmed Ali",
    cleaning_status: "Clean",
    cleaning_status_overdue_days: 0,
    establishment_current_status: "Active",
    created_by__full_name: "Admin User",
    created_date: "2024-01-01T09:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-15T11:00:00",
    status: "Active"
  },
  {
    id: 2,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT002",
    establishment_name: "Ocean View Cafe",
    trade_license_no: "TL789012",
    trade_license_name: "Ocean View Hospitality LLC",
    trade_license_expiry: "2024-11-30",
    office_email: "contact@oceanviewcafe.com",
    address: "456 Jumeirah Beach Road, Dubai",
    phone_no: "+971 4 987 6543",
    entity_location: "Jumeirah",
    po_box: "54321",
    makhani_no: "MK789012",
    no_of_hours: 16,
    no_of_rooms: 3,
    no_of_kitchens: 1,
    meals_per_day: 500,
    seating_capacity: 100,
    gps_coordinates: "25.1972, 55.2744",
    google_location: "Jumeirah Beach Road, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC002",
    foodwatch_id: "FW002",
    foodwatch_business_id: "FB002",
    subarea__area__area: "Jumeirah",
    subarea__sub_area: "Beach Road",
    subarea__area__zone__zone_name: "Zone 2",
    sub_category__main_category__main_category: "Cafe",
    sub_category__sub_category: "Beach Cafe",
    active_contact_person__full_name: "Sarah Johnson",
    active_contact_person__email: "sarah@oceanviewcafe.com",
    active_contact_person__contact_number: "+971 50 987 6543",
    inspection_status: "Pending",
    last_inspected_date: "2024-02-28T14:30:00",
    last_inspected_by__full_name: "Mohammed Hassan",
    cleaning_status: "Needs Cleaning",
    cleaning_status_overdue_days: 5,
    establishment_current_status: "Active",
    created_by__full_name: "Admin User",
    created_date: "2024-01-15T10:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-10T15:00:00",
    status: "Active"
  },
  {
    id: 3,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT003",
    establishment_name: "Desert Oasis Hotel",
    trade_license_no: "TL345678",
    trade_license_name: "Desert Oasis Hospitality LLC",
    trade_license_expiry: "2025-01-31",
    office_email: "info@desertoasis.com",
    address: "789 Sheikh Zayed Road, Dubai",
    phone_no: "+971 4 456 7890",
    entity_location: "Sheikh Zayed Road",
    po_box: "98765",
    makhani_no: "MK345678",
    no_of_hours: 24,
    no_of_rooms: 50,
    no_of_kitchens: 5,
    meals_per_day: 2000,
    seating_capacity: 500,
    gps_coordinates: "25.2285, 55.2867",
    google_location: "Sheikh Zayed Road, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC003",
    foodwatch_id: "FW003",
    foodwatch_business_id: "FB003",
    subarea__area__area: "Downtown",
    subarea__sub_area: "Sheikh Zayed Road",
    subarea__area__zone__zone_name: "Zone 3",
    sub_category__main_category__main_category: "Hotel",
    sub_category__sub_category: "5 Star Hotel",
    active_contact_person__full_name: "David Wilson",
    active_contact_person__email: "david@desertoasis.com",
    active_contact_person__contact_number: "+971 50 456 7890",
    inspection_status: "Failed",
    last_inspected_date: "2024-03-01T09:00:00",
    last_inspected_by__full_name: "Fatima Ahmed",
    cleaning_status: "Dirty",
    cleaning_status_overdue_days: 10,
    establishment_current_status: "Under Review",
    created_by__full_name: "Admin User",
    created_date: "2024-01-20T11:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-05T16:00:00",
    status: "Disabled"
  }
]; 

export const entityDummyData = [
  {
    id: 1,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT001",
    establishment_name: "Sunset Restaurant",
    trade_license_no: "TL123456",
    trade_license_name: "Sunset Food Services LLC",
    trade_license_expiry: "2024-12-31",
    office_email: "info@sunsetrestaurant.com",
    address: "123 Business Bay, Dubai",
    phone_no: "+971 4 123 4567",
    entity_location: "Business Bay",
    po_box: "12345",
    makhani_no: "MK123456",
    no_of_hours: 24,
    no_of_rooms: 5,
    no_of_kitchens: 2,
    meals_per_day: 1000,
    seating_capacity: 200,
    gps_coordinates: "25.2048, 55.2708",
    google_location: "Business Bay, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC001",
    foodwatch_id: "FW001",
    foodwatch_business_id: "FB001",
    subarea__area__area: "Downtown",
    subarea__sub_area: "Business Bay",
    subarea__area__zone__zone_name: "Zone 1",
    sub_category__main_category__main_category: "Restaurant",
    sub_category__sub_category: "Fine Dining",
    active_contact_person__full_name: "John Smith",
    active_contact_person__email: "john@sunsetrestaurant.com",
    active_contact_person__contact_number: "+971 50 123 4567",
    inspection_status: "Passed",
    last_inspected_date: "2024-03-15T10:00:00",
    last_inspected_by__full_name: "Ahmed Ali",
    cleaning_status: "Clean",
    cleaning_status_overdue_days: 0,
    establishment_current_status: "Active",
    created_by__full_name: "Admin User",
    created_date: "2024-01-01T09:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-15T11:00:00",
    status: "Active"
  },
  {
    id: 2,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT002",
    establishment_name: "Ocean View Cafe",
    trade_license_no: "TL789012",
    trade_license_name: "Ocean View Hospitality LLC",
    trade_license_expiry: "2024-11-30",
    office_email: "contact@oceanviewcafe.com",
    address: "456 Jumeirah Beach Road, Dubai",
    phone_no: "+971 4 987 6543",
    entity_location: "Jumeirah",
    po_box: "54321",
    makhani_no: "MK789012",
    no_of_hours: 16,
    no_of_rooms: 3,
    no_of_kitchens: 1,
    meals_per_day: 500,
    seating_capacity: 100,
    gps_coordinates: "25.1972, 55.2744",
    google_location: "Jumeirah Beach Road, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC002",
    foodwatch_id: "FW002",
    foodwatch_business_id: "FB002",
    subarea__area__area: "Jumeirah",
    subarea__sub_area: "Beach Road",
    subarea__area__zone__zone_name: "Zone 2",
    sub_category__main_category__main_category: "Cafe",
    sub_category__sub_category: "Beach Cafe",
    active_contact_person__full_name: "Sarah Johnson",
    active_contact_person__email: "sarah@oceanviewcafe.com",
    active_contact_person__contact_number: "+971 50 987 6543",
    inspection_status: "Pending",
    last_inspected_date: "2024-02-28T14:30:00",
    last_inspected_by__full_name: "Mohammed Hassan",
    cleaning_status: "Needs Cleaning",
    cleaning_status_overdue_days: 5,
    establishment_current_status: "Active",
    created_by__full_name: "Admin User",
    created_date: "2024-01-15T10:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-10T15:00:00",
    status: "Active"
  },
  {
    id: 3,
    image: "https://via.placeholder.com/80",
    establishment_no: "ENT003",
    establishment_name: "Desert Oasis Hotel",
    trade_license_no: "TL345678",
    trade_license_name: "Desert Oasis Hospitality LLC",
    trade_license_expiry: "2025-01-31",
    office_email: "info@desertoasis.com",
    address: "789 Sheikh Zayed Road, Dubai",
    phone_no: "+971 4 456 7890",
    entity_location: "Sheikh Zayed Road",
    po_box: "98765",
    makhani_no: "MK345678",
    no_of_hours: 24,
    no_of_rooms: 50,
    no_of_kitchens: 5,
    meals_per_day: 2000,
    seating_capacity: 500,
    gps_coordinates: "25.2285, 55.2867",
    google_location: "Sheikh Zayed Road, Dubai",
    active_gtcc_detail__gtcc__establishment_name: "Dubai Municipality",
    active_gtcc_detail__gtcc__id: "GTCC003",
    foodwatch_id: "FW003",
    foodwatch_business_id: "FB003",
    subarea__area__area: "Downtown",
    subarea__sub_area: "Sheikh Zayed Road",
    subarea__area__zone__zone_name: "Zone 3",
    sub_category__main_category__main_category: "Hotel",
    sub_category__sub_category: "5 Star Hotel",
    active_contact_person__full_name: "David Wilson",
    active_contact_person__email: "david@desertoasis.com",
    active_contact_person__contact_number: "+971 50 456 7890",
    inspection_status: "Failed",
    last_inspected_date: "2024-03-01T09:00:00",
    last_inspected_by__full_name: "Fatima Ahmed",
    cleaning_status: "Dirty",
    cleaning_status_overdue_days: 10,
    establishment_current_status: "Under Review",
    created_by__full_name: "Admin User",
    created_date: "2024-01-20T11:00:00",
    entity_details_last_modified_by__full_name: "Admin User",
    entity_details_last_modified_date: "2024-03-05T16:00:00",
    status: "Disabled"
  }
];
export const dummyGTCCAssignedData = [
  {
    id: 1,
    gtcc: "GTCC001",
    gtcc_establishment_name: "Green Tech Solutions",
    gtcc_location: "Dubai Industrial City",
    email: "contact@greentech.ae",
    contact_person: "Ahmed Mohammed",
    contact_number: "+971 50 123 4567",
    contract_start_date: "2024-01-01",
    contract_end_date: "2024-12-31",
    user_status: "Active",
    status: "Active"
  },
  {
    id: 2,
    gtcc: "GTCC002",
    gtcc_establishment_name: "Eco Waste Management",
    gtcc_location: "Abu Dhabi Industrial Area",
    email: "info@ecowaste.ae",
    contact_person: "Sarah Al Mansouri",
    contact_number: "+971 50 234 5678",
    contract_start_date: "2024-02-01",
    contract_end_date: "2025-01-31",
    user_status: "Approval Pending",
    status: "Approval Pending"
  },
  {
    id: 3,
    gtcc: "GTCC003",
    gtcc_establishment_name: "Sustainable Solutions LLC",
    gtcc_location: "Sharjah Industrial Area",
    email: "support@sustainable.ae",
    contact_person: "Mohammed Al Qasimi",
    contact_number: "+971 50 345 6789",
    contract_start_date: "2023-12-01",
    contract_end_date: "2024-11-30",
    user_status: "Expired",
    status: "Expired"
  },
  {
    id: 4,
    gtcc: "GTCC004",
    gtcc_establishment_name: "Green Energy Systems",
    gtcc_location: "Ras Al Khaimah",
    email: "contact@greenenergy.ae",
    contact_person: "Fatima Al Nuaimi",
    contact_number: "+971 50 456 7890",
    contract_start_date: "2024-03-01",
    contract_end_date: "2025-02-28",
    user_status: "Active",
    status: "Active"
  },
  {
    id: 5,
    gtcc: "GTCC005",
    gtcc_establishment_name: "Environmental Services Co.",
    gtcc_location: "Ajman Free Zone",
    email: "info@envservices.ae",
    contact_person: "Khalid Al Suwaidi",
    contact_number: "+971 50 567 8901",
    contract_start_date: "2024-01-15",
    contract_end_date: "2025-01-14",
    user_status: "Disabled",
    status: "Disabled"
  }
]; 

export const dummyGreaseTrapData = [
  {
    id: 1,
    image: "/images/grease-trap-1.jpg",
    grease_trap_label: "GT-001",
    description: "Standard Grease Trap",
    foodwatch_id: "FW-2024-001",
    label: "Main Kitchen Trap",
    capacity: "1000L",
    remarks: "Regular maintenance required",
    last_cleaning_date: "2024-03-15",
    cleaning_frequency: 30,
    cleaning_status: "Due",
    cleaning_status_overdue_days: 5,
    created_by: "John Smith",
    created_date: "2024-01-15",
    modified_by_name: "Sarah Johnson",
    modified_date: "2024-03-20",
    status: "Active",
    grease_trap: {
      id: "GT-001",
      description: "Standard Grease Trap",
      image: "/images/grease-trap-1.jpg"
    },
    modified_by: {
      full_name: "Sarah Johnson"
    },
    // created_by: {
    //   full_name: "John Smith"
    // }
  },
  {
    id: 2,
    image: "/images/grease-trap-2.jpg",
    grease_trap_label: "GT-002",
    description: "Large Capacity Trap",
    foodwatch_id: "FW-2024-002",
    label: "Back Kitchen Trap",
    capacity: "2000L",
    remarks: "Needs inspection",
    last_cleaning_date: "2024-02-28",
    cleaning_frequency: 45,
    cleaning_status: "Overdue",
    cleaning_status_overdue_days: 15,
    created_by: "Mike Brown",
    created_date: "2024-01-20",
    modified_by_name: "Lisa Chen",
    modified_date: "2024-03-18",
    status: "Approval Pending",
    grease_trap: {
      id: "GT-002",
      description: "Large Capacity Trap",
      image: "/images/grease-trap-2.jpg"
    },
    modified_by: {
      full_name: "Lisa Chen"
    },
    // created_by: {
    //   full_name: "Mike Brown"
    // }
  },
  {
    id: 3,
    image: "/images/grease-trap-3.jpg",
    grease_trap_label: "GT-003",
    description: "Compact Grease Trap",
    foodwatch_id: "FW-2024-003",
    label: "Service Area Trap",
    capacity: "500L",
    remarks: "Recently serviced",
    last_cleaning_date: "2024-03-10",
    cleaning_frequency: 20,
    cleaning_status: "Cleaned",
    cleaning_status_overdue_days: 0,
    created_by: "Emma Wilson",
    created_date: "2024-02-01",
    modified_by_name: "David Lee",
    modified_date: "2024-03-15",
    status: "Disabled",
    grease_trap: {
      id: "GT-003",
      description: "Compact Grease Trap",
      image: "/images/grease-trap-3.jpg"
    },
    modified_by: {
      full_name: "David Lee"
    },
    // created_by: {
    //   full_name: "Emma Wilson"
    // }
  }
];

export const dummyFixtureData = [
  {
    id: 1,
    fixture_id: "FIX001",
    fixture: "Kitchen Sink",
    fixture_type: "Faucets",
    size: "Standard",
    image: "/images/fixtures/sink1.jpg",
    status: "Active",
    created_by: "Admin User",
    created_date: "2024-03-15T10:00:00",
    modified_by: "System Admin",
    modified_date: "2024-03-16T15:30:00"
  },
  {
    id: 2,
    fixture_id: "FIX002",
    fixture: "Floor Drain",
    fixture_type: "Fixtures",
    size: "Large",
    image: "/images/fixtures/drain1.jpg",
    status: "Active",
    created_by: "Manager User",
    created_date: "2024-03-14T09:00:00",
    modified_by: "Manager User",
    modified_date: "2024-03-15T11:20:00"
  },
  {
    id: 3,
    fixture_id: "FIX003",
    fixture: "Grease Trap",
    fixture_type: "Faucets",
    size: "Medium",
    image: "/images/fixtures/trap1.jpg",
    status: "Disabled",
    created_by: "Admin User",
    created_date: "2024-03-13T14:00:00",
    modified_by: "System Admin",
    modified_date: "2024-03-14T16:45:00"
  },
  {
    id: 4,
    fixture_id: "FIX004",
    fixture: "Floor Sink",
    fixture_type: "Fixtures",
    size: "Small",
    image: "/images/fixtures/sink2.jpg",
    status: "Active",
    created_by: "Manager User",
    created_date: "2024-03-12T11:00:00",
    modified_by: "Manager User",
    modified_date: "2024-03-13T13:15:00"
  },
  {
    id: 5,
    fixture_id: "FIX005",
    fixture: "Floor Drain",
    fixture_type: "Fixtures",
    size: "Extra Large",
    image: "/images/fixtures/drain2.jpg",
    status: "Deleted",
    created_by: "Admin User",
    created_date: "2024-03-11T16:00:00",
    modified_by: "System Admin",
    modified_date: "2024-03-12T10:30:00"
  }
];

export const dummyServiceRequests = [
  {
    sr_no: "SR-2024-001",
    foodwatch_srid: "FW-2024-001",
    entity_foodwatch_id: "EFW-2024-001",
    entity_trade_license_no: "TL-123456",
    gtcc_name: "ABC Waste Management",
    gtcc: "GTCC-001",
    grease_trap_count: 3,
    area: "Downtown",
    sub_area: "Business District",
    category: "Restaurant",
    sub_category: "Fine Dining",
    zone: "Zone A",
    grease_trap_label: "GT-001",
    trap_type: "Standard",
    total_gallon_collected: 150,
    vehicle_no: "VH-2024-001",
    txn_id: "TXN-2024-001",
    created_date: "2024-03-20T10:00:00",
    collection_completion_time: "2024-03-20T11:30:00",
    discharge_time: "2024-03-20T12:00:00",
    initiator: "John Doe",
    status: "Collected",
    reason_for_cancelation: null,
    sr_report_file: "reports/sr-2024-001.pdf",
    id: "SR-2024-001"
  },
  {
    sr_no: "SR-2024-002",
    foodwatch_srid: "FW-2024-002",
    entity_foodwatch_id: "EFW-2024-002",
    entity_trade_license_no: "TL-789012",
    gtcc_name: "Green Solutions",
    gtcc: "GTCC-002",
    grease_trap_count: 2,
    area: "Uptown",
    sub_area: "Shopping Mall",
    category: "Food Court",
    sub_category: "Fast Food",
    zone: "Zone B",
    grease_trap_label: "GT-002",
    trap_type: "Compact",
    total_gallon_collected: 75,
    vehicle_no: "VH-2024-002",
    txn_id: "TXN-2024-002",
    created_date: "2024-03-20T09:00:00",
    collection_completion_time: "2024-03-20T10:30:00",
    discharge_time: "2024-03-20T11:00:00",
    initiator: "Jane Smith",
    status: "Discharged",
    reason_for_cancelation: null,
    sr_report_file: "reports/sr-2024-002.pdf",
    id: "SR-2024-002"
  },
  {
    sr_no: "SR-2024-003",
    foodwatch_srid: "FW-2024-003",
    entity_foodwatch_id: "EFW-2024-003",
    entity_trade_license_no: "TL-345678",
    gtcc_name: "Eco Services",
    gtcc: "GTCC-003",
    grease_trap_count: 1,
    area: "Westside",
    sub_area: "Industrial Park",
    category: "Manufacturing",
    sub_category: "Food Processing",
    zone: "Zone C",
    grease_trap_label: "GT-003",
    trap_type: "Industrial",
    total_gallon_collected: 200,
    vehicle_no: "VH-2024-003",
    txn_id: "TXN-2024-003",
    created_date: "2024-03-20T08:00:00",
    collection_completion_time: null,
    discharge_time: null,
    initiator: "Mike Johnson",
    status: "Processing",
    reason_for_cancelation: null,
    sr_report_file: null,
    id: "SR-2024-003"
  },
  {
    sr_no: "SR-2024-004",
    foodwatch_srid: "FW-2024-004",
    entity_foodwatch_id: "EFW-2024-004",
    entity_trade_license_no: "TL-901234",
    gtcc_name: "Clean Tech",
    gtcc: "GTCC-004",
    grease_trap_count: 4,
    area: "Eastside",
    sub_area: "Commercial Hub",
    category: "Hotel",
    sub_category: "5-Star",
    zone: "Zone D",
    grease_trap_label: "GT-004",
    trap_type: "Premium",
    total_gallon_collected: 300,
    vehicle_no: "VH-2024-004",
    txn_id: "TXN-2024-004",
    created_date: "2024-03-20T07:00:00",
    collection_completion_time: null,
    discharge_time: null,
    initiator: "Sarah Wilson",
    status: "Cancelled",
    reason_for_cancelation: "Client requested cancellation",
    sr_report_file: null,
    id: "SR-2024-004"
  },
  {
    sr_no: "SR-2024-005",
    foodwatch_srid: "FW-2024-005",
    entity_foodwatch_id: "EFW-2024-005",
    entity_trade_license_no: "TL-567890",
    gtcc_name: "Waste Masters",
    gtcc: "GTCC-005",
    grease_trap_count: 2,
    area: "Southside",
    sub_area: "Residential Complex",
    category: "Cafeteria",
    sub_category: "Corporate",
    zone: "Zone E",
    grease_trap_label: "GT-005",
    trap_type: "Standard",
    total_gallon_collected: 100,
    vehicle_no: "VH-2024-005",
    txn_id: "TXN-2024-005",
    created_date: "2024-03-20T06:00:00",
    collection_completion_time: null,
    discharge_time: null,
    initiator: "David Brown",
    status: "Initiated",
    reason_for_cancelation: null,
    sr_report_file: null,
    id: "SR-2024-005"
  }
];

export const dummyInspectionData = [
  {
    inspection_id: "INS-2024-001",
    entity__subarea__area__area: "North Zone",
    contact_person_name: "John Smith",
    contact_person_designation: "Facility Manager",
    contact_person_number: "+971 50 123 4567",
    is_inspection_follow_up: "Yes",
    follow_up_date: "2024-03-20",
    follow_up_remarks: "Need to verify compliance with new regulations",
    completed_notes: "All safety measures are in place",
    is_report_to_dm: "Yes",
    action_by_dm: "Yes",
    inspection_status: "Completed",
    created_by__full_name: "Ahmed Hassan",
    created_date__date: "2024-03-15",
    approve_or_rejected_by__full_name: "Mohammed Ali",
    approve_or_rejected_date__date: "2024-03-16",
    modified_by__full_name: "Sarah Johnson",
    modified_date__date: "2024-03-17"
  },
  {
    inspection_id: "INS-2024-002",
    entity__subarea__area__area: "South Zone",
    contact_person_name: "Maria Garcia",
    contact_person_designation: "Operations Director",
    contact_person_number: "+971 50 987 6543",
    is_inspection_follow_up: "No",
    follow_up_date: null,
    follow_up_remarks: "No follow-up required",
    completed_notes: "Minor issues found, corrective actions taken",
    is_report_to_dm: "No",
    action_by_dm: "No",
    inspection_status: "Pending",
    created_by__full_name: "David Wilson",
    created_date__date: "2024-03-18",
    approve_or_rejected_by__full_name: null,
    approve_or_rejected_date__date: null,
    modified_by__full_name: "David Wilson",
    modified_date__date: "2024-03-18"
  },
  {
    inspection_id: "INS-2024-003",
    entity__subarea__area__area: "East Zone",
    contact_person_name: "Fatima Al Mansouri",
    contact_person_designation: "Safety Officer",
    contact_person_number: "+971 50 456 7890",
    is_inspection_follow_up: "Yes",
    follow_up_date: "2024-03-25",
    follow_up_remarks: "Schedule follow-up for new equipment installation",
    completed_notes: "Equipment maintenance required",
    is_report_to_dm: "Yes",
    action_by_dm: "No",
    inspection_status: "Approved",
    created_by__full_name: "Khalid Mohammed",
    created_date__date: "2024-03-19",
    approve_or_rejected_by__full_name: "Abdullah Al Qasimi",
    approve_or_rejected_date__date: "2024-03-20",
    modified_by__full_name: "Khalid Mohammed",
    modified_date__date: "2024-03-19"
  }
];

export const dummyManageGreaseTrapsData = [
  {
    id: 1,
    image: "path/to/image1.jpg",
    grease_trap_label: "GT-2024-001",
    foodwatch_grease_trap_id: "FWT-001",
    entity: {
      id: 101,
      establishment_no: "EST-2024-001",
      establishment_name: "Sunset Restaurant",
      trade_license_no: "TL-2024-001",
      active_gtcc_detail: {
        id: 201,
        gtcc: {
          establishment_name: "Green Clean Services",
          id: 301
        }
      },
      subarea: {
        sub_area: "Downtown",
        area: {
          area: "Central District",
          zone: {
            zone_name: "Zone A"
          }
        }
      },
      sub_category: {
        sub_category: "Fine Dining",
        main_category: {
          main_category: "Restaurant"
        }
      }
    },
    grease_trap: {
      description: "Commercial Grade",
      image: "path/to/trap1.jpg"
    },
    capacity: "1000L",
    last_cleaning_date: "2024-03-15",
    next_cleaning_date: "2024-04-15",
    cleaning_frequency: 30,
    cleaning_status: "Due",
    cleaning_status_overdue_days: 0,
    remarks: "Regular maintenance required",
    created_by: {
      full_name: "John Smith"
    },
    created_date: "2024-01-01T10:00:00Z",
    modified_by: {
      full_name: "Jane Doe"
    },
    modified_date: "2024-03-20T15:30:00Z",
    status: "Active"
  },
  {
    id: 2,
    image: "path/to/image2.jpg",
    grease_trap_label: "GT-2024-002",
    foodwatch_grease_trap_id: "FWT-002",
    entity: {
      id: 102,
      establishment_no: "EST-2024-002",
      establishment_name: "Ocean View Cafe",
      trade_license_no: "TL-2024-002",
      active_gtcc_detail: {
        id: 202,
        gtcc: {
          establishment_name: "Eco Clean Solutions",
          id: 302
        }
      },
      subarea: {
        sub_area: "Beachfront",
        area: {
          area: "Coastal District",
          zone: {
            zone_name: "Zone B"
          }
        }
      },
      sub_category: {
        sub_category: "Cafe",
        main_category: {
          main_category: "Food Service"
        }
      }
    },
    grease_trap: {
      description: "Medium Capacity",
      image: "path/to/trap2.jpg"
    },
    capacity: "750L",
    last_cleaning_date: "2024-03-01",
    next_cleaning_date: "2024-03-31",
    cleaning_frequency: 30,
    cleaning_status: "Overdue",
    cleaning_status_overdue_days: 5,
    remarks: "Urgent cleaning needed",
    created_by: {
      full_name: "Mike Johnson"
    },
    created_date: "2024-01-15T09:00:00Z",
    modified_by: {
      full_name: "Sarah Wilson"
    },
    modified_date: "2024-03-25T14:20:00Z",
    status: "Active"
  }
]

export const dummyFoodwatchEntityData  = [
  {
    foodwatch_id: "FW001",
    business_id: "BIZ001",
    license_nr: "TL123456",
    name_of_establishment: "Golden Dragon Restaurant",
    category: "Restaurant",
    sub_category: "Chinese Cuisine",
    fogwatch_sub_area__area__area: "Downtown",
    fogwatch_sub_area__sub_area: "Business District",
    fogwatch_sub_area__area__zone__zone_name: "Zone A",
    address: "123 Main Street",
    po_box: "12345",
    makani_nr: "MK789012",
    office_email: "contact@goldendragon.com",
    office_line: "+971-4-1234567",
    created_date__date: "2024-03-15T10:30:00Z",
    remarks: "Regular inspection completed",
    status: "Active"
  },
  {
    foodwatch_id: "FW002",
    business_id: "BIZ002",
    license_nr: "TL789012",
    name_of_establishment: "Ocean View Cafe",
    category: "Cafe",
    sub_category: "International",
    fogwatch_sub_area__area__area: "Beachfront",
    fogwatch_sub_area__sub_area: "Coastal Area",
    fogwatch_sub_area__area__zone__zone_name: "Zone B",
    address: "456 Beach Road",
    po_box: "67890",
    makani_nr: "MK345678",
    office_email: "info@oceanview.com",
    office_line: "+971-4-7654321",
    created_date__date: "2024-03-14T15:45:00Z",
    remarks: "Pending renovation",
    status: "Inactive"
  },
  {
    foodwatch_id: "FW003",
    business_id: "BIZ003",
    license_nr: "TL345678",
    name_of_establishment: "Spice Garden",
    category: "Restaurant",
    sub_category: "Indian Cuisine",
    fogwatch_sub_area__area__area: "Residential",
    fogwatch_sub_area__sub_area: "Garden District",
    fogwatch_sub_area__area__zone__zone_name: "Zone C",
    address: "789 Garden Street",
    po_box: "23456",
    makani_nr: "MK901234",
    office_email: "contact@spicegarden.com",
    office_line: "+971-4-9876543",
    created_date__date: "2024-03-13T09:15:00Z",
    remarks: "New management",
    status: "Synced"
  },
  {
    foodwatch_id: "FW004",
    business_id: "BIZ004",
    license_nr: "TL901234",
    name_of_establishment: "Quick Bite",
    category: "Fast Food",
    sub_category: "Burgers",
    fogwatch_sub_area__area__area: "Mall",
    fogwatch_sub_area__sub_area: "Food Court",
    fogwatch_sub_area__area__zone__zone_name: "Zone D",
    address: "101 Mall Road",
    po_box: "34567",
    makani_nr: "MK567890",
    office_email: "orders@quickbite.com",
    office_line: "+971-4-4567890",
    created_date__date: "2024-03-12T14:20:00Z",
    remarks: "Operating normally",
    status: "Active"
  },
  {
    foodwatch_id: "FW005",
    business_id: "BIZ005",
    license_nr: "TL567890",
    name_of_establishment: "Sweet Delights",
    category: "Bakery",
    sub_category: "Pastries",
    fogwatch_sub_area__area__area: "Commercial",
    fogwatch_sub_area__sub_area: "Shopping District",
    fogwatch_sub_area__area__zone__zone_name: "Zone E",
    address: "202 Sweet Street",
    po_box: "45678",
    makani_nr: "MK123456",
    office_email: "info@sweetdelights.com",
    office_line: "+971-4-3456789",
    created_date__date: "2024-03-11T11:00:00Z",
    remarks: "Expansion planned",
    status: "Converted"
  }
];

export const dummyInspectionMainList = [
  {
    inspection_id: "INS-001",
    entity__establishment_name: "Sample Restaurant",
    entity__establishment_id: "ENT-001",
    entity__subarea__area__area: "Downtown",
    contact_person_name: "John Doe",
    contact_person_designation: "Manager",
    contact_person_number: "+1234567890",
    contact_person_email: "john@samplerestaurant.com",
    is_inspection_follow_up: true,
    follow_up_date: "2024-03-15",
    follow_up_remarks: "Need to check compliance",
    completed_notes: "Initial inspection completed",
    is_report_to_dm: true,
    action_by_dm: "Pending Review",
    inspection_status: "Pending",
    created_by__full_name: "Inspector Smith",
    created_date__date: "2024-03-01",
    approve_or_rejected_by__full_name: "DM Johnson",
    approve_or_rejected_date__date: "2024-03-02",
    modified_by__full_name: "Inspector Smith",
    modified_date__date: "2024-03-03",
    status: "Active"
  },
  {
    inspection_id: "INS-002",
    entity__establishment_name: "City Cafe",
    entity__establishment_id: "ENT-002",
    entity__subarea__area__area: "Uptown",
    contact_person_name: "Jane Smith",
    contact_person_designation: "Owner",
    contact_person_number: "+1987654321",
    contact_person_email: "jane@citycafe.com",
    is_inspection_follow_up: false,
    follow_up_date: null,
    follow_up_remarks: "",
    completed_notes: "All requirements met",
    is_report_to_dm: false,
    action_by_dm: "Approved",
    inspection_status: "Completed",
    created_by__full_name: "Inspector Brown",
    created_date__date: "2024-03-05",
    approve_or_rejected_by__full_name: "DM Wilson",
    approve_or_rejected_date__date: "2024-03-06",
    modified_by__full_name: "Inspector Brown",
    modified_date__date: "2024-03-06",
    status: "Active"
  },
  {
    inspection_id: "INS-003",
    entity__establishment_name: "Ocean View Restaurant",
    entity__establishment_id: "ENT-003",
    entity__subarea__area__area: "Beachside",
    contact_person_name: "Mike Johnson",
    contact_person_designation: "Operations Manager",
    contact_person_number: "+1122334455",
    contact_person_email: "mike@oceanview.com",
    is_inspection_follow_up: true,
    follow_up_date: "2024-03-20",
    follow_up_remarks: "Minor violations found",
    completed_notes: "Follow-up required",
    is_report_to_dm: true,
    action_by_dm: "Under Review",
    inspection_status: "In Progress",
    created_by__full_name: "Inspector Davis",
    created_date__date: "2024-03-10",
    approve_or_rejected_by__full_name: null,
    approve_or_rejected_date__date: null,
    modified_by__full_name: "Inspector Davis",
    modified_date__date: "2024-03-10",
    status: "Active"
  }
];


export const dummyNotificationData  = [
  {
    id: 1,
    title: "System Maintenance",
    body: "Scheduled maintenance will be performed on the system from 2 AM to 4 AM EST.",
    start_time: "2024-03-20T02:00:00Z",
    end_time: "2024-03-20T04:00:00Z",
    status: "Queued"
  },
  {
    id: 2,
    title: "New Feature Release",
    body: "Exciting new features have been added to the platform. Check out the latest updates!",
    start_time: "2024-03-15T00:00:00Z",
    end_time: "2024-03-25T23:59:59Z",
    status: "Active"
  },
  {
    id: 3,
    title: "Holiday Schedule",
    body: "Office will be closed for the upcoming holiday weekend.",
    start_time: "2024-03-01T00:00:00Z",
    end_time: "2024-03-05T23:59:59Z",
    status: "Expired"
  },
  {
    id: 4,
    title: "Training Session",
    body: "Mandatory training session for all employees on new safety protocols.",
    start_time: "2024-03-25T10:00:00Z",
    end_time: "2024-03-25T12:00:00Z",
    status: "Queued"
  },
  {
    id: 5,
    title: "System Update",
    body: "Critical security updates will be applied to the system.",
    start_time: "2024-03-10T00:00:00Z",
    end_time: "2024-03-12T23:59:59Z",
    status: "Expired"
  }
]; 

export const dummyBankData = [
  {
    bank_id: "B001",
    bank_name: "Global Trust Bank",
    logo: "/images/banks/global-trust.png",
    is_retail: true,
    is_corporate: true,
    status: "Active"
  },
  {
    bank_id: "B002",
    bank_name: "Metro Commercial Bank",
    logo: "/images/banks/metro-commercial.png",
    is_retail: false,
    is_corporate: true,
    status: "Active"
  },
  {
    bank_id: "B003",
    bank_name: "Community Savings Bank",
    logo: "/images/banks/community-savings.png",
    is_retail: true,
    is_corporate: false,
    status: "Inactive"
  },
  {
    bank_id: "B004",
    bank_name: "Capital Investment Bank",
    logo: "/images/banks/capital-investment.png",
    is_retail: true,
    is_corporate: true,
    status: "Active"
  },
  {
    bank_id: "B005",
    bank_name: "Regional Credit Union",
    logo: "/images/banks/regional-credit.png",
    is_retail: true,
    is_corporate: false,
    status: "Active"
  },
  {
    bank_id: "B006",
    bank_name: "International Finance Bank",
    logo: "/images/banks/international-finance.png",
    is_retail: false,
    is_corporate: true,
    status: "Inactive"
  },
  {
    bank_id: "B007",
    bank_name: "Digital Banking Solutions",
    logo: "/images/banks/digital-banking.png",
    is_retail: true,
    is_corporate: true,
    status: "Active"
  },
  {
    bank_id: "B008",
    bank_name: "Heritage Savings Bank",
    logo: "/images/banks/heritage-savings.png",
    is_retail: true,
    is_corporate: false,
    status: "Active"
  }
]; 

export const dummyCategoryData = [
  {
    id: 1,
    category_id: "CAT001",
    category: "Restaurant",
    sub_category: "Fine Dining",
    foodwatch_id: "FW001",
    foodwatch_name: "Gourmet Delights",
    status: "Active"
  },
  {
    id: 2,
    category_id: "CAT002",
    category: "Restaurant",
    sub_category: "Fast Food",
    foodwatch_id: "FW002",
    foodwatch_name: "Quick Bites",
    status: "Active"
  },
  {
    id: 3,
    category_id: "CAT003",
    category: "Hotel",
    sub_category: "5 Star",
    foodwatch_id: "FW003",
    foodwatch_name: "Luxury Stays",
    status: "Disabled"
  },
  {
    id: 4,
    category_id: "CAT004",
    category: "Cafe",
    sub_category: "Coffee Shop",
    foodwatch_id: "FW004",
    foodwatch_name: "Brew & Bites",
    status: "Active"
  },
  {
    id: 5,
    category_id: "CAT005",
    category: "Restaurant",
    sub_category: "Casual Dining",
    foodwatch_id: "FW005",
    foodwatch_name: "Family Feast",
    status: "Deleted"
  }
];


export const modeOfPaymentData = [
  {
      mop_id: 1,
      mop_name: "Cash",
      status: "active"
  },
  {
      mop_id: 2,
      mop_name: "Credit Card",
      status: "active"
  },
  {
      mop_id: 3,
      mop_name: "Debit Card",
      status: "active"
  },
  {
      mop_id: 4,
      mop_name: "Bank Transfer",
      status: "active"
  },
  {
      mop_id: 5,
      mop_name: "UPI",
      status: "active"
  },
  {
      mop_id: 6,
      mop_name: "Net Banking",
      status: "active"
  },
  {
      mop_id: 7,
      mop_name: "Digital Wallet",
      status: "active"
  },
  {
      mop_id: 8,
      mop_name: "Cheque",
      status: "inactive"
  },
  {
      mop_id: 9,
      mop_name: "PayPal",
      status: "active"
  },
  {
      mop_id: 10,
      mop_name: "Cryptocurrency",
      status: "inactive"
  }
];

export const designationData = [
    {
        designation_id: "DES001",
        designation_name: "Software Engineer",
        status: "Active",
        created_by: "Admin User",
        created_date: "2024-03-15T10:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-16T15:30:00"
    },
    {
        designation_id: "DES002",
        designation_name: "Project Manager",
        status: "Active",
        created_by: "Admin User",
        created_date: "2024-03-14T09:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-15T11:20:00"
    },
    {
        designation_id: "DES003",
        designation_name: "Business Analyst",
        status: "Inactive",
        created_by: "Admin User",
        created_date: "2024-03-13T14:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-14T16:45:00"
    },
    {
        designation_id: "DES004",
        designation_name: "UI/UX Designer",
        status: "Active",
        created_by: "Admin User",
        created_date: "2024-03-12T11:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-13T13:15:00"
    },
    {
        designation_id: "DES005",
        designation_name: "DevOps Engineer",
        status: "Deleted",
        created_by: "Admin User",
        created_date: "2024-03-11T16:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-12T10:30:00"
    },
    {
        designation_id: "DES006",
        designation_name: "Quality Assurance Engineer",
        status: "Active",
        created_by: "Admin User",
        created_date: "2024-03-10T13:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-11T14:20:00"
    },
    {
        designation_id: "DES007",
        designation_name: "Technical Lead",
        status: "Active",
        created_by: "Admin User",
        created_date: "2024-03-09T15:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-10T16:40:00"
    },
    {
        designation_id: "DES008",
        designation_name: "Product Manager",
        status: "Inactive",
        created_by: "Admin User",
        created_date: "2024-03-08T12:00:00",
        modified_by: "System Admin",
        modified_date: "2024-03-09T13:50:00"
    }
];

export const dummySensorsData = [
  {
    id: 1,
    device_id: "SENSOR-001",
    device_name: "Kitchen Temperature Sensor",
    device_timezone: "America/New_York",
    created_date: "2024-03-15T10:30:00Z",
    status: "Active"
  },
  {
    id: 2,
    device_id: "SENSOR-002",
    device_name: "Freezer Humidity Monitor",
    device_timezone: "America/Chicago",
    created_date: "2024-03-14T15:45:00Z",
    status: "Disabled"
  },
  {
    id: 3,
    device_id: "SENSOR-003",
    device_name: "Storage Room Sensor",
    device_timezone: "America/Los_Angeles",
    created_date: "2024-03-13T09:15:00Z",
    status: "Deleted"
  },
  {
    id: 4,
    device_id: "SENSOR-004",
    device_name: "Main Kitchen Monitor",
    device_timezone: "America/New_York",
    created_date: "2024-03-12T14:20:00Z",
    status: "Active"
  },
  {
    id: 5,
    device_id: "SENSOR-005",
    device_name: "Backup Freezer Sensor",
    device_timezone: "America/Chicago",
    created_date: "2024-03-11T11:00:00Z",
    status: "Active"
  }
]

export const dummyRFIDData = [
  {
    id: "1",
    tag_id: "RFID123456",
    friendly_name: "Truck-1-RFID",
    rfid_class: "Class A",
    vehicle: {
      vehicle_no: "KA01AB1234",
      gtcc: {
        establishment_name: "GTCC Mumbai"
      }
    },
    status: "Active"
  },
  {
    id: "2",
    tag_id: "RFID789012",
    friendly_name: "Car-2-RFID",
    rfid_class: "Class B",
    vehicle: {
      vehicle_no: "MH02CD5678",
      gtcc: {
        establishment_name: "GTCC Delhi"
      }
    },
    status: "Disabled"
  },
  {
    id: "3",
    tag_id: "RFID345678",
    friendly_name: "Van-3-RFID",
    rfid_class: "Premium",
    vehicle: {
      vehicle_no: "TN03EF9012",
      gtcc: {
        establishment_name: "GTCC Chennai"
      }
    },
    status: "Active"
  },
  {
    id: "4",
    tag_id: "RFID901234",
    friendly_name: "Truck-4-RFID",
    rfid_class: "Class A",
    vehicle: {
      vehicle_no: "DL04GH3456",
      gtcc: {
        establishment_name: "GTCC Bangalore"
      }
    },
    status: "Deleted"
  },
  {
    id: "5",
    tag_id: "RFID567890",
    friendly_name: "Car-5-RFID",
    rfid_class: "Class B",
    vehicle: {
      vehicle_no: "GJ05IJ7890",
      gtcc: {
        establishment_name: "GTCC Ahmedabad"
      }
    },
    status: "Active"
  },
  {
    id: "6",
    tag_id: "RFID234567",
    friendly_name: "Van-6-RFID",
    rfid_class: "Premium",
    vehicle: {
      vehicle_no: "WB06KL1234",
      gtcc: {
        establishment_name: "GTCC Kolkata"
      }
    },
    status: "Disabled"
  },
  {
    id: "7",
    tag_id: "RFID890123",
    friendly_name: "Truck-7-RFID",
    rfid_class: "Class A",
    vehicle: {
      vehicle_no: "AP07MN5678",
      gtcc: {
        establishment_name: "GTCC Hyderabad"
      }
    },
    status: "Active"
  },
  {
    id: "8",
    tag_id: "RFID456789",
    friendly_name: "Car-8-RFID",
    rfid_class: "Class B",
    vehicle: {
      vehicle_no: "RJ08OP9012",
      gtcc: {
        establishment_name: "GTCC Jaipur"
      }
    },
    status: "Deleted"
  }
]

export const dummyGatesData = [
  {
    id: "GATE001",
    gate_name: "Main Entrance Gate",
    last_query_time: "2024-03-20T10:30:00",
    last_query_type: "Entry",
    status: "Active",
    remote_status: "Online"
  },
  {
    id: "GATE002",
    gate_name: "Service Gate",
    last_query_time: "2024-03-20T09:15:00",
    last_query_type: "Exit",
    status: "Disabled",
    remote_status: "Offline"
  },
  {
    id: "GATE003",
    gate_name: "Emergency Exit Gate",
    last_query_time: "2024-03-19T23:45:00",
    last_query_type: "Entry",
    status: "Deleted",
    remote_status: "Online"
  },
  {
    id: "GATE004",
    gate_name: "Parking Gate A",
    last_query_time: "2024-03-20T08:00:00",
    last_query_type: "Exit",
    status: "Active",
    remote_status: "Online"
  },
  {
    id: "GATE005",
    gate_name: "Loading Dock Gate",
    last_query_time: "2024-03-20T11:20:00",
    last_query_type: "Entry",
    status: "Disabled",
    remote_status: "Offline"
  }
]

export const dummyGreaseTrapTypeData =[
  {
    "image": "grease_traps/gt1.jpg",
    "grease_trap_id": "GT001",
    "foodwatch_id": "FW123",
    "part_no": "PN456",
    "manufacturer": "EcoTech Solutions",
    "material": "Stainless Steel",
    "description": "Commercial grade grease trap with high efficiency",
    "width": "24",
    "length": "36",
    "capacity": "500",
    "remarks": "Suitable for restaurants",
    "shape": "Rectangular",
    "status": "Active",
    "id": "1"
  },
  {
    "image": "grease_traps/gt2.jpg",
    "grease_trap_id": "GT002",
    "foodwatch_id": "FW124",
    "part_no": "PN457",
    "manufacturer": "GreenFlow Systems",
    "material": "Polyethylene",
    "description": "Compact grease trap for small kitchens",
    "width": "18",
    "length": "24",
    "capacity": "300",
    "remarks": "Ideal for cafes",
    "shape": "Square",
    "status": "Disabled",
    "id": "2"
  },
  {
    "image": "grease_traps/gt3.jpg",
    "grease_trap_id": "GT003",
    "foodwatch_id": null,
    "part_no": "PN458",
    "manufacturer": "AquaTech Industries",
    "material": "Fiberglass",
    "description": "Heavy-duty grease trap for industrial use",
    "width": "36",
    "length": "48",
    "capacity": "1000",
    "remarks": "For industrial kitchens",
    "shape": "Rectangular",
    "status": "Deleted",
    "id": "3"
  },
  {
    "image": "grease_traps/gt4.jpg",
    "grease_trap_id": "GT004",
    "foodwatch_id": "FW125",
    "part_no": "PN459",
    "manufacturer": "CleanFlow Solutions",
    "material": "Stainless Steel",
    "description": "High-capacity grease trap with automatic cleaning",
    "width": "30",
    "length": "42",
    "capacity": "750",
    "remarks": "With auto-cleaning feature",
    "shape": "Rectangular",
    "status": "Active",
    "id": "4"
  },
  {
    "image": "grease_traps/gt5.jpg",
    "grease_trap_id": "GT005",
    "foodwatch_id": "FW126",
    "part_no": "PN460",
    "manufacturer": "EcoTech Solutions",
    "material": "Polyethylene",
    "description": "Standard grease trap for medium-sized kitchens",
    "width": "20",
    "length": "30",
    "capacity": "400",
    "remarks": "Standard model",
    "shape": "Square",
    "status": "Active",
    "id": "5"
  }
]

export const dummyViolationTypesData = [
  {
    id: 1,
    violation_type_id: "VT001",
    violation_type_name: "Late Grease Trap Cleaning",
    violator: "GTCC",
    source: "DM",
    status: "Active"
  },
  {
    id: 2,
    violation_type_id: "VT002",
    violation_type_name: "Improper Waste Disposal",
    violator: "Entity",
    source: "DM",
    status: "Active"
  },
  {
    id: 3,
    violation_type_id: "VT003",
    violation_type_name: "Non-Compliant Equipment",
    violator: "Entity",
    source: "Envirol",
    status: "Disabled"
  },
  {
    id: 4,
    violation_type_id: "VT004",
    violation_type_name: "Missing Documentation",
    violator: "GTCC",
    source: "Envirol",
    status: "Active"
  },
  {
    id: 5,
    violation_type_id: "VT005",
    violation_type_name: "Unregistered Vehicle",
    violator: "GTCC",
    source: "DM",
    status: "Deleted"
  },
  {
    id: 6,
    violation_type_id: "VT006",
    violation_type_name: "Incomplete Service Report",
    violator: "GTCC",
    source: "Envirol",
    status: "Active"
  },
  {
    id: 7,
    violation_type_id: "VT007",
    violation_type_name: "Unauthorized Discharge",
    violator: "Entity",
    source: "DM",
    status: "Disabled"
  },
  {
    id: 8,
    violation_type_id: "VT008",
    violation_type_name: "Expired License",
    violator: "Entity",
    source: "Envirol",
    status: "Active"
  }
];

export const dummyZoneData = [
  {
    id: 1,
    zone_id: 101,
    area_id: 201,
    status: 'Active',
    zone_no: 'Z001',
    sub_area: 'Sub Area 1',
    area_name: 'North Area',
    area_code: 'NA001',
    zone_name: 'North Zone',
    foodwatch_id: 'FW001',
    foodwatch_name: 'Foodwatch North'
  },
  {
    id: 2,
    zone_id: 102,
    area_id: 202,
    status: 'Active',
    zone_no: 'Z002',
    sub_area: 'Sub Area 2',
    area_name: 'South Area',
    area_code: 'SA001',
    zone_name: 'South Zone',
    foodwatch_id: 'FW002',
    foodwatch_name: 'Foodwatch South'
  },
  {
    id: 3,
    zone_id: 103,
    area_id: 203,
    status: 'Disabled',
    zone_no: 'Z003',
    sub_area: 'Sub Area 3',
    area_name: 'East Area',
    area_code: 'EA001',
    zone_name: 'East Zone',
    foodwatch_id: 'FW003',
    foodwatch_name: 'Foodwatch East'
  },
  {
    id: 4,
    zone_id: 104,
    area_id: 204,
    status: 'Deleted',
    zone_no: 'Z004',
    sub_area: 'Sub Area 4',
    area_name: 'West Area',
    area_code: 'WA001',
    zone_name: 'West Zone',
    foodwatch_id: 'FW004',
    foodwatch_name: 'Foodwatch West'
  },
  {
    id: 5,
    zone_id: 105,
    area_id: 205,
    status: 'Active',
    zone_no: 'Z005',
    sub_area: 'Sub Area 5',
    area_name: 'Central Area',
    area_code: 'CA001',
    zone_name: 'Central Zone',
    foodwatch_id: 'FW005',
    foodwatch_name: 'Foodwatch Central'
  }
];

export const dummyGTCCData = [
  {
      id: 1,
      gtcc_no: 'GTCC001',
      establishment_name: 'Al Ain GTCC',
      foodwatch_id: 'FW001',
      foodwatch_business_id: 'BIZ001',
      trade_license_no: 'TL001',
      trade_license_name: 'John Smith',
      trn_no: 'TRN123456',
      address: '123 Business Street, Dubai',
      office_email: 'office@alain-gtcc.com',
      location: 'Dubai',
      phone_no: '+971 4 123 4567',
      po_box: '12345',
      active_contact_person__full_name: 'Sarah Johnson',
      active_contact_person__email: 'sarah@alain-gtcc.com',
      active_contact_person__contact_number: '+971 50 123 4567',
      active_contact_person__designation__designation: 'Manager',
      env_sap_id: 'SAP001',
      credit_available: '50,000 AED',
      created_by__full_name: 'Admin User',
      exclude_vat_intercompany: true,
      created_date: '2024-01-15',
      gtcc_details_last_modified_by__full_name: 'Admin User',
      gtcc_details_last_modified_date__date: '2024-02-01',
      status: 'Active'
  },
  {
      id: 2,
      gtcc_no: 'GTCC002',
      establishment_name: 'Abu Dhabi GTCC',
      foodwatch_id: 'FW002',
      foodwatch_business_id: 'BIZ002',
      trade_license_no: 'TL002',
      trade_license_name: 'Michael Brown',
      trn_no: 'TRN789012',
      address: '456 Corporate Avenue, Abu Dhabi',
      office_email: 'office@abudhabi-gtcc.com',
      location: 'Abu Dhabi',
      phone_no: '+971 2 123 4567',
      po_box: '67890',
      active_contact_person__full_name: 'David Wilson',
      active_contact_person__email: 'david@abudhabi-gtcc.com',
      active_contact_person__contact_number: '+971 50 987 6543',
      active_contact_person__designation__designation: 'Director',
      env_sap_id: 'SAP002',
      credit_available: '75,000 AED',
      created_by__full_name: 'Admin User',
      exclude_vat_intercompany: false,
      created_date: '2024-01-20',
      gtcc_details_last_modified_by__full_name: 'Admin User',
      gtcc_details_last_modified_date__date: '2024-02-05',
      status: 'Active'
  },
  {
      id: 3,
      gtcc_no: 'GTCC003',
      establishment_name: 'Sharjah GTCC',
      foodwatch_id: 'FW003',
      foodwatch_business_id: 'BIZ003',
      trade_license_no: 'TL003',
      trade_license_name: 'Emma Davis',
      trn_no: 'TRN345678',
      address: '789 Industrial Zone, Sharjah',
      office_email: 'office@sharjah-gtcc.com',
      location: 'Sharjah',
      phone_no: '+971 6 123 4567',
      po_box: '54321',
      active_contact_person__full_name: 'Lisa Anderson',
      active_contact_person__email: 'lisa@sharjah-gtcc.com',
      active_contact_person__contact_number: '+971 50 456 7890',
      active_contact_person__designation__designation: 'Operations Manager',
      env_sap_id: 'SAP003',
      credit_available: '100,000 AED',
      created_by__full_name: 'Admin User',
      exclude_vat_intercompany: true,
      created_date: '2024-01-25',
      gtcc_details_last_modified_by__full_name: 'Admin User',
      gtcc_details_last_modified_date__date: '2024-02-10',
      status: 'Disabled'
  }
];

export const dummyPaymentReportData = [
  {
    id: 1,
    txn_no: "TXN-2024-001",
    gtcc__establishment_name: "Burger King",
    gtcc__establishment_id: "GTCC-001",
    reference_no: "REF-2024-001",
    amount: 1500.00,
    mode_of_payment__mode_of_payment: "Credit Card",
    payment_type: "Monthly Subscription",
    payment_date: "2024-03-15",
    created_by__full_name: "John Smith",
    status: "Active"
  },
  {
    id: 2,
    txn_no: "TXN-2024-002",
    gtcc__establishment_name: "McDonald's",
    gtcc__establishment_id: "GTCC-002",
    reference_no: "REF-2024-002",
    amount: 2000.00,
    mode_of_payment__mode_of_payment: "Bank Transfer",
    payment_type: "Annual Fee",
    payment_date: "2024-03-14",
    created_by__full_name: "Sarah Johnson",
    status: "Active"
  },
  {
    id: 3,
    txn_no: "TXN-2024-003",
    gtcc__establishment_name: "KFC",
    gtcc__establishment_id: "GTCC-003",
    reference_no: "REF-2024-003",
    amount: 1800.00,
    mode_of_payment__mode_of_payment: "Debit Card",
    payment_type: "Quarterly Payment",
    payment_date: "2024-03-13",
    created_by__full_name: "Michael Brown",
    status: "Disabled"
  },
  {
    id: 4,
    txn_no: "TXN-2024-004",
    gtcc__establishment_name: "Subway",
    gtcc__establishment_id: "GTCC-004",
    reference_no: "REF-2024-004",
    amount: 1200.00,
    mode_of_payment__mode_of_payment: "Cash",
    payment_type: "Monthly Subscription",
    payment_date: "2024-03-12",
    created_by__full_name: "Emily Davis",
    status: "Active"
  },
  {
    id: 5,
    txn_no: "TXN-2024-005",
    gtcc__establishment_name: "Pizza Hut",
    gtcc__establishment_id: "GTCC-005",
    reference_no: "REF-2024-005",
    amount: 2500.00,
    mode_of_payment__mode_of_payment: "Credit Card",
    payment_type: "Annual Fee",
    payment_date: "2024-03-11",
    created_by__full_name: "David Wilson",
    status: "Deleted"
  },
  {
    id: 6,
    txn_no: "TXN-2024-006",
    gtcc__establishment_name: "Domino's",
    gtcc__establishment_id: "GTCC-006",
    reference_no: "REF-2024-006",
    amount: 1600.00,
    mode_of_payment__mode_of_payment: "Bank Transfer",
    payment_type: "Quarterly Payment",
    payment_date: "2024-03-10",
    created_by__full_name: "Lisa Anderson",
    status: "Active"
  },
  {
    id: 7,
    txn_no: "TXN-2024-007",
    gtcc__establishment_name: "Taco Bell",
    gtcc__establishment_id: "GTCC-007",
    reference_no: "REF-2024-007",
    amount: 1900.00,
    mode_of_payment__mode_of_payment: "Debit Card",
    payment_type: "Monthly Subscription",
    payment_date: "2024-03-09",
    created_by__full_name: "Robert Taylor",
    status: "Disabled"
  },
  {
    id: 8,
    txn_no: "TXN-2024-008",
    gtcc__establishment_name: "Wendy's",
    gtcc__establishment_id: "GTCC-008",
    reference_no: "REF-2024-008",
    amount: 2200.00,
    mode_of_payment__mode_of_payment: "Credit Card",
    payment_type: "Annual Fee",
    payment_date: "2024-03-08",
    created_by__full_name: "Jennifer Martinez",
    status: "Active"
  },
  {
    id: 9,
    txn_no: "TXN-2024-009",
    gtcc__establishment_name: "Chipotle",
    gtcc__establishment_id: "GTCC-009",
    reference_no: "REF-2024-009",
    amount: 1700.00,
    mode_of_payment__mode_of_payment: "Bank Transfer",
    payment_type: "Quarterly Payment",
    payment_date: "2024-03-07",
    created_by__full_name: "William Thompson",
    status: "Active"
  },
  {
    id: 10,
    txn_no: "TXN-2024-010",
    gtcc__establishment_name: "Panera Bread",
    gtcc__establishment_id: "GTCC-010",
    reference_no: "REF-2024-010",
    amount: 2100.00,
    mode_of_payment__mode_of_payment: "Debit Card",
    payment_type: "Monthly Subscription",
    payment_date: "2024-03-06",
    created_by__full_name: "Patricia Garcia",
    status: "Deleted"
  }
];  

export const dummyRFIDAccessLogData = [
  {
    rfid_number: "RFID123456",
    gate__gate_name: "Main Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T10:30:45",
    tapped_status: "Success",
    vehicle_entry_status: "Entered"
  },
  {
    rfid_number: "RFID789012",
    gate__gate_name: "Employee Gate",
    response: "Access Denied",
    tapped_time: "2024-03-25T11:15:20",
    tapped_status: "Failed",
    vehicle_entry_status: "Denied"
  },
  {
    rfid_number: "RFID345678",
    gate__gate_name: "Visitor Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T12:45:10",
    tapped_status: "Success",
    vehicle_entry_status: "Entered"
  },
  {
    rfid_number: "RFID901234",
    gate__gate_name: "Main Gate",
    response: "Invalid Card",
    tapped_time: "2024-03-25T13:20:35",
    tapped_status: "Failed",
    vehicle_entry_status: "Denied"
  },
  {
    rfid_number: "RFID567890",
    gate__gate_name: "Employee Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T14:05:15",
    tapped_status: "Success",
    vehicle_entry_status: "Exited"
  },
  {
    rfid_number: "RFID234567",
    gate__gate_name: "Visitor Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T15:30:00",
    tapped_status: "Success",
    vehicle_entry_status: "Entered"
  },
  {
    rfid_number: "RFID890123",
    gate__gate_name: "Main Gate",
    response: "Access Denied",
    tapped_time: "2024-03-25T16:15:45",
    tapped_status: "Failed",
    vehicle_entry_status: "Denied"
  },
  {
    rfid_number: "RFID456789",
    gate__gate_name: "Employee Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T17:00:30",
    tapped_status: "Success",
    vehicle_entry_status: "Exited"
  },
  {
    rfid_number: "RFID012345",
    gate__gate_name: "Visitor Gate",
    response: "Invalid Card",
    tapped_time: "2024-03-25T18:45:20",
    tapped_status: "Failed",
    vehicle_entry_status: "Denied"
  },
  {
    rfid_number: "RFID678901",
    gate__gate_name: "Main Gate",
    response: "Access Granted",
    tapped_time: "2024-03-25T19:30:10",
    tapped_status: "Success",
    vehicle_entry_status: "Entered"
  }
]; 