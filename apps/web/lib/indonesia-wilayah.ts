/**
 * Data Wilayah Administrasi Pemerintahan Republik Indonesia (38 Provinsi & 514 Kabupaten/Kota)
 * Sumber: Kepmendagri No 300.2.2-2430 / cahyadsn/wilayah (https://github.com/cahyadsn/wilayah)
 */

export interface WilayahProvince {
  kode: string;
  nama: string;
  ibukota: string;
}

export interface WilayahRegency {
  kode: string;
  nama: string;
  ibukota: string;
  provinceCode: string;
}

export const INDONESIA_PROVINCES: WilayahProvince[] = [
  {
    "kode": "11",
    "nama": "Aceh",
    "ibukota": "Banda Aceh"
  },
  {
    "kode": "12",
    "nama": "Sumatera Utara",
    "ibukota": "Medan"
  },
  {
    "kode": "13",
    "nama": "Sumatera Barat",
    "ibukota": "Padang"
  },
  {
    "kode": "14",
    "nama": "Riau",
    "ibukota": "Pekanbaru"
  },
  {
    "kode": "15",
    "nama": "Jambi",
    "ibukota": "Jambi"
  },
  {
    "kode": "16",
    "nama": "Sumatera Selatan",
    "ibukota": "Palembang"
  },
  {
    "kode": "17",
    "nama": "Bengkulu",
    "ibukota": "Bengkulu"
  },
  {
    "kode": "18",
    "nama": "Lampung",
    "ibukota": "Bandar Lampung"
  },
  {
    "kode": "19",
    "nama": "Kepulauan Bangka Belitung",
    "ibukota": "Pangkalpinang"
  },
  {
    "kode": "21",
    "nama": "Kepulauan Riau",
    "ibukota": "Tanjungpinang"
  },
  {
    "kode": "31",
    "nama": "Daerah Khusus Ibukota Jakarta",
    "ibukota": "Jakarta"
  },
  {
    "kode": "32",
    "nama": "Jawa Barat",
    "ibukota": "Bandung"
  },
  {
    "kode": "33",
    "nama": "Jawa Tengah",
    "ibukota": "Semarang"
  },
  {
    "kode": "34",
    "nama": "Daerah Istimewa Yogyakarta",
    "ibukota": "Yogyakarta"
  },
  {
    "kode": "35",
    "nama": "Jawa Timur",
    "ibukota": "Surabaya"
  },
  {
    "kode": "36",
    "nama": "Banten",
    "ibukota": "Serang"
  },
  {
    "kode": "51",
    "nama": "Bali",
    "ibukota": "Denpasar"
  },
  {
    "kode": "52",
    "nama": "Nusa Tenggara Barat",
    "ibukota": "Mataram"
  },
  {
    "kode": "53",
    "nama": "Nusa Tenggara Timur",
    "ibukota": "Kupang"
  },
  {
    "kode": "61",
    "nama": "Kalimantan Barat",
    "ibukota": "Pontianak"
  },
  {
    "kode": "62",
    "nama": "Kalimantan Tengah",
    "ibukota": "Palangkaraya"
  },
  {
    "kode": "63",
    "nama": "Kalimantan Selatan",
    "ibukota": "Banjarmasin"
  },
  {
    "kode": "64",
    "nama": "Kalimantan Timur",
    "ibukota": "Samarinda"
  },
  {
    "kode": "65",
    "nama": "Kalimantan Utara",
    "ibukota": "Tanjung Selor"
  },
  {
    "kode": "71",
    "nama": "Sulawesi Utara",
    "ibukota": "Manado"
  },
  {
    "kode": "72",
    "nama": "Sulawesi Tengah",
    "ibukota": "Palu"
  },
  {
    "kode": "73",
    "nama": "Sulawesi Selatan",
    "ibukota": "Makassar"
  },
  {
    "kode": "74",
    "nama": "Sulawesi Tenggara",
    "ibukota": "Kendari"
  },
  {
    "kode": "75",
    "nama": "Gorontalo",
    "ibukota": "Gorontalo"
  },
  {
    "kode": "76",
    "nama": "Sulawesi Barat",
    "ibukota": "Mamuju"
  },
  {
    "kode": "81",
    "nama": "Maluku",
    "ibukota": "Ambon"
  },
  {
    "kode": "82",
    "nama": "Maluku Utara",
    "ibukota": "Sofifi"
  },
  {
    "kode": "91",
    "nama": "Papua",
    "ibukota": "Jayapura"
  },
  {
    "kode": "92",
    "nama": "Papua Barat",
    "ibukota": "Manokwari"
  },
  {
    "kode": "93",
    "nama": "Papua Selatan",
    "ibukota": "Merauke"
  },
  {
    "kode": "94",
    "nama": "Papua Tengah",
    "ibukota": "Nabira"
  },
  {
    "kode": "95",
    "nama": "Papua Pegunungan",
    "ibukota": "Jayawijaya"
  },
  {
    "kode": "96",
    "nama": "Papua Barat Daya",
    "ibukota": "Sorong"
  }
];

export const INDONESIA_REGENCIES_BY_PROVINCE: Record<string, WilayahRegency[]> = {
  11: [
    {
        "kode": "11.01",
        "nama": "Kabupaten Aceh Selatan",
        "ibukota": "Tapak Tuan",
        "provinceCode": "11"
    },
    {
        "kode": "11.02",
        "nama": "Kabupaten Aceh Tenggara",
        "ibukota": "Kutacane",
        "provinceCode": "11"
    },
    {
        "kode": "11.03",
        "nama": "Kabupaten Aceh Timur",
        "ibukota": "Idi Rayeuk",
        "provinceCode": "11"
    },
    {
        "kode": "11.04",
        "nama": "Kabupaten Aceh Tengah",
        "ibukota": "Takengon",
        "provinceCode": "11"
    },
    {
        "kode": "11.05",
        "nama": "Kabupaten Aceh Barat",
        "ibukota": "Meulaboh",
        "provinceCode": "11"
    },
    {
        "kode": "11.06",
        "nama": "Kabupaten Aceh Besar",
        "ibukota": "Kota Jantho",
        "provinceCode": "11"
    },
    {
        "kode": "11.07",
        "nama": "Kabupaten Pidie",
        "ibukota": "Sigli",
        "provinceCode": "11"
    },
    {
        "kode": "11.08",
        "nama": "Kabupaten Aceh Utara",
        "ibukota": "Lhoksukon",
        "provinceCode": "11"
    },
    {
        "kode": "11.09",
        "nama": "Kabupaten Simeulue",
        "ibukota": "Sinabang",
        "provinceCode": "11"
    },
    {
        "kode": "11.10",
        "nama": "Kabupaten Aceh Singkil",
        "ibukota": "Singkil",
        "provinceCode": "11"
    },
    {
        "kode": "11.11",
        "nama": "Kabupaten Bireuen",
        "ibukota": "Bireuen",
        "provinceCode": "11"
    },
    {
        "kode": "11.12",
        "nama": "Kabupaten Aceh Barat Daya",
        "ibukota": "Blangpidie",
        "provinceCode": "11"
    },
    {
        "kode": "11.13",
        "nama": "Kabupaten Gayo Lues",
        "ibukota": "Blang Kejeren",
        "provinceCode": "11"
    },
    {
        "kode": "11.14",
        "nama": "Kabupaten Aceh Jaya",
        "ibukota": "Calang",
        "provinceCode": "11"
    },
    {
        "kode": "11.15",
        "nama": "Kabupaten Nagan Raya",
        "ibukota": "Suka Makmue",
        "provinceCode": "11"
    },
    {
        "kode": "11.16",
        "nama": "Kabupaten Aceh Tamiang",
        "ibukota": "Karang Baru",
        "provinceCode": "11"
    },
    {
        "kode": "11.17",
        "nama": "Kabupaten Bener Meriah",
        "ibukota": "Simpang Tiga Redelong",
        "provinceCode": "11"
    },
    {
        "kode": "11.18",
        "nama": "Kabupaten Pidie Jaya",
        "ibukota": "Meureudu",
        "provinceCode": "11"
    },
    {
        "kode": "11.71",
        "nama": "Kota Banda Aceh",
        "ibukota": "Banda Aceh",
        "provinceCode": "11"
    },
    {
        "kode": "11.72",
        "nama": "Kota Sabang",
        "ibukota": "Sabang",
        "provinceCode": "11"
    },
    {
        "kode": "11.73",
        "nama": "Kota Lhokseumawe",
        "ibukota": "Lhokseumawe",
        "provinceCode": "11"
    },
    {
        "kode": "11.74",
        "nama": "Kota Langsa",
        "ibukota": "Langsa",
        "provinceCode": "11"
    },
    {
        "kode": "11.75",
        "nama": "Kota Subulussalam",
        "ibukota": "Subulussalam",
        "provinceCode": "11"
    }
],
  12: [
    {
        "kode": "12.01",
        "nama": "Kabupaten Tapanuli Tengah",
        "ibukota": "Pandan",
        "provinceCode": "12"
    },
    {
        "kode": "12.02",
        "nama": "Kabupaten Tapanuli Utara",
        "ibukota": "Tarutung",
        "provinceCode": "12"
    },
    {
        "kode": "12.03",
        "nama": "Kabupaten Tapanuli Selatan",
        "ibukota": "Sipirok",
        "provinceCode": "12"
    },
    {
        "kode": "12.04",
        "nama": "Kabupaten Nias",
        "ibukota": "Gido",
        "provinceCode": "12"
    },
    {
        "kode": "12.05",
        "nama": "Kabupaten Langkat",
        "ibukota": "Stabat",
        "provinceCode": "12"
    },
    {
        "kode": "12.06",
        "nama": "Kabupaten Karo",
        "ibukota": "Kabanjahe",
        "provinceCode": "12"
    },
    {
        "kode": "12.07",
        "nama": "Kabupaten Deli Serdang",
        "ibukota": "Lubuk Pakam",
        "provinceCode": "12"
    },
    {
        "kode": "12.08",
        "nama": "Kabupaten Simalungun",
        "ibukota": "Raya",
        "provinceCode": "12"
    },
    {
        "kode": "12.09",
        "nama": "Kabupaten Asahan",
        "ibukota": "Kisaran",
        "provinceCode": "12"
    },
    {
        "kode": "12.10",
        "nama": "Kabupaten Labuhanbatu",
        "ibukota": "Rantau Prapat",
        "provinceCode": "12"
    },
    {
        "kode": "12.11",
        "nama": "Kabupaten Dairi",
        "ibukota": "Sidikalang",
        "provinceCode": "12"
    },
    {
        "kode": "12.12",
        "nama": "Kabupaten Toba",
        "ibukota": "Balige",
        "provinceCode": "12"
    },
    {
        "kode": "12.13",
        "nama": "Kabupaten Mandailing Natal",
        "ibukota": "Panyabungan",
        "provinceCode": "12"
    },
    {
        "kode": "12.14",
        "nama": "Kabupaten Nias Selatan",
        "ibukota": "Teluk Dalam",
        "provinceCode": "12"
    },
    {
        "kode": "12.15",
        "nama": "Kabupaten Pakpak Bharat",
        "ibukota": "Salak",
        "provinceCode": "12"
    },
    {
        "kode": "12.16",
        "nama": "Kabupaten Humbang Hasundutan",
        "ibukota": "Dolok Sanggul",
        "provinceCode": "12"
    },
    {
        "kode": "12.17",
        "nama": "Kabupaten Samosir",
        "ibukota": "Pangururan",
        "provinceCode": "12"
    },
    {
        "kode": "12.18",
        "nama": "Kabupaten Serdang Bedagai",
        "ibukota": "Sei Rampah",
        "provinceCode": "12"
    },
    {
        "kode": "12.19",
        "nama": "Kabupaten Batu Bara",
        "ibukota": "Limapuluh",
        "provinceCode": "12"
    },
    {
        "kode": "12.20",
        "nama": "Kabupaten Padang Lawas Utara",
        "ibukota": "Gunung Tua",
        "provinceCode": "12"
    },
    {
        "kode": "12.21",
        "nama": "Kabupaten Padang Lawas",
        "ibukota": "Sibuhuan",
        "provinceCode": "12"
    },
    {
        "kode": "12.22",
        "nama": "Kabupaten Labuhanbatu Selatan",
        "ibukota": "Pinang",
        "provinceCode": "12"
    },
    {
        "kode": "12.23",
        "nama": "Kabupaten Labuhanbatu Utara",
        "ibukota": "Aek Kanopan",
        "provinceCode": "12"
    },
    {
        "kode": "12.24",
        "nama": "Kabupaten Nias Utara",
        "ibukota": "Lotu",
        "provinceCode": "12"
    },
    {
        "kode": "12.25",
        "nama": "Kabupaten Nias Barat",
        "ibukota": "Lahomi",
        "provinceCode": "12"
    },
    {
        "kode": "12.71",
        "nama": "Kota Medan",
        "ibukota": "Medan",
        "provinceCode": "12"
    },
    {
        "kode": "12.72",
        "nama": "Kota Pematangsiantar",
        "ibukota": "Pematangsiantar",
        "provinceCode": "12"
    },
    {
        "kode": "12.73",
        "nama": "Kota Sibolga",
        "ibukota": "Sibolga",
        "provinceCode": "12"
    },
    {
        "kode": "12.74",
        "nama": "Kota Tanjungbalai",
        "ibukota": "Tanjungbalai",
        "provinceCode": "12"
    },
    {
        "kode": "12.75",
        "nama": "Kota Binjai",
        "ibukota": "Binjai",
        "provinceCode": "12"
    },
    {
        "kode": "12.76",
        "nama": "Kota Tebing Tinggi",
        "ibukota": "Tebing Tinggi",
        "provinceCode": "12"
    },
    {
        "kode": "12.77",
        "nama": "Kota Padangsidimpuan",
        "ibukota": "Padangsidimpuan",
        "provinceCode": "12"
    },
    {
        "kode": "12.78",
        "nama": "Kota Gunungsitoli",
        "ibukota": "Gunungsitoli",
        "provinceCode": "12"
    }
],
  13: [
    {
        "kode": "13.01",
        "nama": "Kabupaten Pesisir Selatan",
        "ibukota": "Painan",
        "provinceCode": "13"
    },
    {
        "kode": "13.02",
        "nama": "Kabupaten Solok",
        "ibukota": "Arosuka",
        "provinceCode": "13"
    },
    {
        "kode": "13.03",
        "nama": "Kabupaten Sijunjung",
        "ibukota": "Muaro Sijunjung",
        "provinceCode": "13"
    },
    {
        "kode": "13.04",
        "nama": "Kabupaten Tanah Datar",
        "ibukota": "Batusangkar",
        "provinceCode": "13"
    },
    {
        "kode": "13.05",
        "nama": "Kabupaten Padang Pariaman",
        "ibukota": "Parit Malintang",
        "provinceCode": "13"
    },
    {
        "kode": "13.06",
        "nama": "Kabupaten Agam",
        "ibukota": "Lubuk Basung",
        "provinceCode": "13"
    },
    {
        "kode": "13.07",
        "nama": "Kabupaten Lima Puluh Kota",
        "ibukota": "Sarilamak",
        "provinceCode": "13"
    },
    {
        "kode": "13.08",
        "nama": "Kabupaten Pasaman",
        "ibukota": "Lubuk Sikaping",
        "provinceCode": "13"
    },
    {
        "kode": "13.09",
        "nama": "Kabupaten Kepulauan Mentawai",
        "ibukota": "Tuapejat",
        "provinceCode": "13"
    },
    {
        "kode": "13.10",
        "nama": "Kabupaten Dharmasraya",
        "ibukota": "Pulau Punjung",
        "provinceCode": "13"
    },
    {
        "kode": "13.11",
        "nama": "Kabupaten Solok Selatan",
        "ibukota": "Padang Aro",
        "provinceCode": "13"
    },
    {
        "kode": "13.12",
        "nama": "Kabupaten Pasaman Barat",
        "ibukota": "Simpang Ampek",
        "provinceCode": "13"
    },
    {
        "kode": "13.71",
        "nama": "Kota Padang",
        "ibukota": "Padang",
        "provinceCode": "13"
    },
    {
        "kode": "13.72",
        "nama": "Kota Solok",
        "ibukota": "Solok",
        "provinceCode": "13"
    },
    {
        "kode": "13.73",
        "nama": "Kota Sawahlunto",
        "ibukota": "Sawahlunto",
        "provinceCode": "13"
    },
    {
        "kode": "13.74",
        "nama": "Kota Padang Panjang",
        "ibukota": "Padangpanjang",
        "provinceCode": "13"
    },
    {
        "kode": "13.75",
        "nama": "Kota Bukittinggi",
        "ibukota": "Bukittinggi",
        "provinceCode": "13"
    },
    {
        "kode": "13.76",
        "nama": "Kota Payakumbuh",
        "ibukota": "Payakumbuh",
        "provinceCode": "13"
    },
    {
        "kode": "13.77",
        "nama": "Kota Pariaman",
        "ibukota": "Pariaman",
        "provinceCode": "13"
    }
],
  14: [
    {
        "kode": "14.01",
        "nama": "Kabupaten Kampar",
        "ibukota": "Bangkinang",
        "provinceCode": "14"
    },
    {
        "kode": "14.02",
        "nama": "Kabupaten Indragiri Hulu",
        "ibukota": "Rengat",
        "provinceCode": "14"
    },
    {
        "kode": "14.03",
        "nama": "Kabupaten Bengkalis",
        "ibukota": "Bengkalis",
        "provinceCode": "14"
    },
    {
        "kode": "14.04",
        "nama": "Kabupaten Indragiri Hilir",
        "ibukota": "Tembilahan",
        "provinceCode": "14"
    },
    {
        "kode": "14.05",
        "nama": "Kabupaten Pelalawan",
        "ibukota": "Pangkalan Kerinci",
        "provinceCode": "14"
    },
    {
        "kode": "14.06",
        "nama": "Kabupaten Rokan Hulu",
        "ibukota": "Pasir Pengaraian",
        "provinceCode": "14"
    },
    {
        "kode": "14.07",
        "nama": "Kabupaten Rokan Hilir",
        "ibukota": "Bagansiapiapi",
        "provinceCode": "14"
    },
    {
        "kode": "14.08",
        "nama": "Kabupaten Siak",
        "ibukota": "Siak Sri Indrapura",
        "provinceCode": "14"
    },
    {
        "kode": "14.09",
        "nama": "Kabupaten Kuantan Singingi",
        "ibukota": "Taluk Kuantan",
        "provinceCode": "14"
    },
    {
        "kode": "14.10",
        "nama": "Kabupaten Kepulauan Meranti",
        "ibukota": "Selatpanjang",
        "provinceCode": "14"
    },
    {
        "kode": "14.71",
        "nama": "Kota Pekanbaru",
        "ibukota": "Pekanbaru",
        "provinceCode": "14"
    },
    {
        "kode": "14.72",
        "nama": "Kota Dumai",
        "ibukota": "Dumai",
        "provinceCode": "14"
    }
],
  15: [
    {
        "kode": "15.01",
        "nama": "Kabupaten Kerinci",
        "ibukota": "Siulak",
        "provinceCode": "15"
    },
    {
        "kode": "15.02",
        "nama": "Kabupaten  Merangin",
        "ibukota": "Bangko",
        "provinceCode": "15"
    },
    {
        "kode": "15.03",
        "nama": "Kabupaten Sarolangun",
        "ibukota": "Sarolangun",
        "provinceCode": "15"
    },
    {
        "kode": "15.04",
        "nama": "Kabupaten Batanghari",
        "ibukota": "Muara Bulian",
        "provinceCode": "15"
    },
    {
        "kode": "15.05",
        "nama": "Kabupaten  Muaro Jambi",
        "ibukota": "Sengeti",
        "provinceCode": "15"
    },
    {
        "kode": "15.06",
        "nama": "Kabupaten Tanjung Jabung Barat",
        "ibukota": "Kuala Tungkal",
        "provinceCode": "15"
    },
    {
        "kode": "15.07",
        "nama": "Kabupaten Tanjung Jabung Timur",
        "ibukota": "Muara Sabak",
        "provinceCode": "15"
    },
    {
        "kode": "15.08",
        "nama": "Kabupaten Bungo",
        "ibukota": "Muara Bungo",
        "provinceCode": "15"
    },
    {
        "kode": "15.09",
        "nama": "Kabupaten Tebo",
        "ibukota": "Muara Tebo",
        "provinceCode": "15"
    },
    {
        "kode": "15.71",
        "nama": "Kota Jambi",
        "ibukota": "Jambi",
        "provinceCode": "15"
    },
    {
        "kode": "15.72",
        "nama": "Kota Sungai Penuh",
        "ibukota": "Sungaipenuh",
        "provinceCode": "15"
    }
],
  16: [
    {
        "kode": "16.01",
        "nama": "Kabupaten Ogan Komering Ulu",
        "ibukota": "Baturaja",
        "provinceCode": "16"
    },
    {
        "kode": "16.02",
        "nama": "Kabupaten Ogan Komering",
        "ibukota": "Kayu Agung",
        "provinceCode": "16"
    },
    {
        "kode": "16.03",
        "nama": "Kabupaten Muara Enim",
        "ibukota": "Muara Enim",
        "provinceCode": "16"
    },
    {
        "kode": "16.04",
        "nama": "Kabupaten Lahat",
        "ibukota": "Lahat",
        "provinceCode": "16"
    },
    {
        "kode": "16.05",
        "nama": "Kabupaten Musi Rawas",
        "ibukota": "Muara Beliti Baru",
        "provinceCode": "16"
    },
    {
        "kode": "16.06",
        "nama": "Kabupaten Musi Banyuasin",
        "ibukota": "Sekayu",
        "provinceCode": "16"
    },
    {
        "kode": "16.07",
        "nama": "Kabupaten Banyuasin",
        "ibukota": "Pangkalan Balai",
        "provinceCode": "16"
    },
    {
        "kode": "16.08",
        "nama": "Kabupaten Ogan Komering Ulu Timur",
        "ibukota": "Martapura",
        "provinceCode": "16"
    },
    {
        "kode": "16.09",
        "nama": "Kabupaten Ogan Komering Ulu Selatan",
        "ibukota": "Muaradua",
        "provinceCode": "16"
    },
    {
        "kode": "16.10",
        "nama": "Kabupaten Ogan Ilir",
        "ibukota": "Indralaya",
        "provinceCode": "16"
    },
    {
        "kode": "16.11",
        "nama": "Kabupaten Empat Lawang",
        "ibukota": "Tebing Tinggi",
        "provinceCode": "16"
    },
    {
        "kode": "16.12",
        "nama": "Kabupaten Penukal Abab Lematang Ilir",
        "ibukota": "Talang Ubi",
        "provinceCode": "16"
    },
    {
        "kode": "16.13",
        "nama": "Kabupaten Musi Rawas Utara",
        "ibukota": "Rupit",
        "provinceCode": "16"
    },
    {
        "kode": "16.71",
        "nama": "Kota Palembang",
        "ibukota": "Palembang",
        "provinceCode": "16"
    },
    {
        "kode": "16.72",
        "nama": "Kota Pagar Alam",
        "ibukota": "Pagar Alam",
        "provinceCode": "16"
    },
    {
        "kode": "16.73",
        "nama": "Kota Lubuk Linggau",
        "ibukota": "Lubuklinggau",
        "provinceCode": "16"
    },
    {
        "kode": "16.74",
        "nama": "Kota Prabumulih",
        "ibukota": "Kota Prabumulih",
        "provinceCode": "16"
    }
],
  17: [
    {
        "kode": "17.01",
        "nama": "Kabupaten Bengkulu Selatan",
        "ibukota": "Manna",
        "provinceCode": "17"
    },
    {
        "kode": "17.02",
        "nama": "Kabupaten Rejang Lebong",
        "ibukota": "Curup",
        "provinceCode": "17"
    },
    {
        "kode": "17.03",
        "nama": "Kabupaten Bengkulu Utara",
        "ibukota": "Arga Makmur",
        "provinceCode": "17"
    },
    {
        "kode": "17.04",
        "nama": "Kabupaten Kaur",
        "ibukota": "Bintuhan",
        "provinceCode": "17"
    },
    {
        "kode": "17.05",
        "nama": "Kabupaten Seluma",
        "ibukota": "Tais",
        "provinceCode": "17"
    },
    {
        "kode": "17.06",
        "nama": "Kabupaten Mukomuko",
        "ibukota": "Mukomuko",
        "provinceCode": "17"
    },
    {
        "kode": "17.07",
        "nama": "Kabupaten Lebong",
        "ibukota": "Muara Aman",
        "provinceCode": "17"
    },
    {
        "kode": "17.08",
        "nama": "Kabupaten Kepahiang",
        "ibukota": "Kepahiang",
        "provinceCode": "17"
    },
    {
        "kode": "17.09",
        "nama": "Kabupaten Bengkulu Tengah",
        "ibukota": "Karang Tinggi",
        "provinceCode": "17"
    },
    {
        "kode": "17.71",
        "nama": "Kota Bengkulu",
        "ibukota": "Bengkulu",
        "provinceCode": "17"
    }
],
  18: [
    {
        "kode": "18.01",
        "nama": "Kabupaten Lampung Selatan",
        "ibukota": "Kalianda",
        "provinceCode": "18"
    },
    {
        "kode": "18.02",
        "nama": "Kabupaten Lampung Tengah",
        "ibukota": "Gunung Sugih",
        "provinceCode": "18"
    },
    {
        "kode": "18.03",
        "nama": "Kabupaten Lampung Utara",
        "ibukota": "Kotabumi",
        "provinceCode": "18"
    },
    {
        "kode": "18.04",
        "nama": "Kabupaten Lampung Barat",
        "ibukota": "Liwa",
        "provinceCode": "18"
    },
    {
        "kode": "18.05",
        "nama": "Kabupaten Tulang Bawang",
        "ibukota": "Menggala",
        "provinceCode": "18"
    },
    {
        "kode": "18.06",
        "nama": "Kabupaten Tanggamus",
        "ibukota": "Kota Agung",
        "provinceCode": "18"
    },
    {
        "kode": "18.07",
        "nama": "Kabupaten Lampung Timur",
        "ibukota": "Sukadana",
        "provinceCode": "18"
    },
    {
        "kode": "18.08",
        "nama": "Kabupaten Way Kanan",
        "ibukota": "Blambangan Umpu",
        "provinceCode": "18"
    },
    {
        "kode": "18.09",
        "nama": "Kabupaten Pesawaran",
        "ibukota": "Gedong Tataan",
        "provinceCode": "18"
    },
    {
        "kode": "18.10",
        "nama": "Kabupaten Pringsewu",
        "ibukota": "Pringsewu",
        "provinceCode": "18"
    },
    {
        "kode": "18.11",
        "nama": "Kabupaten Mesuji",
        "ibukota": "Mesuji",
        "provinceCode": "18"
    },
    {
        "kode": "18.12",
        "nama": "Kabupaten Tulang Bawang Barat",
        "ibukota": "Tulang Bawang Tengah",
        "provinceCode": "18"
    },
    {
        "kode": "18.13",
        "nama": "Kabupaten Pesisir Barat",
        "ibukota": "Krui",
        "provinceCode": "18"
    },
    {
        "kode": "18.71",
        "nama": "Kota Bandar Lampung",
        "ibukota": "Bandar Lampung",
        "provinceCode": "18"
    },
    {
        "kode": "18.72",
        "nama": "Kota Metro",
        "ibukota": "Metro",
        "provinceCode": "18"
    }
],
  19: [
    {
        "kode": "19.01",
        "nama": "Kabupaten Bangka",
        "ibukota": "Sungai Liat",
        "provinceCode": "19"
    },
    {
        "kode": "19.02",
        "nama": "Kabupaten Belitung",
        "ibukota": "Tanjung Pandan",
        "provinceCode": "19"
    },
    {
        "kode": "19.03",
        "nama": "Kabupaten Bangka Selatan",
        "ibukota": "Toboali",
        "provinceCode": "19"
    },
    {
        "kode": "19.04",
        "nama": "Kabupaten Bangka Tengah",
        "ibukota": "Koba",
        "provinceCode": "19"
    },
    {
        "kode": "19.05",
        "nama": "Kabupaten Bangka Barat",
        "ibukota": "Muntok",
        "provinceCode": "19"
    },
    {
        "kode": "19.06",
        "nama": "Kabupaten Belitung Timur",
        "ibukota": "Manggar",
        "provinceCode": "19"
    },
    {
        "kode": "19.71",
        "nama": "Kota Pangkal Pinang",
        "ibukota": "Pangkalpinang",
        "provinceCode": "19"
    }
],
  21: [
    {
        "kode": "21.01",
        "nama": "Kabupaten Bintan",
        "ibukota": "Bandar Seri Bentan",
        "provinceCode": "21"
    },
    {
        "kode": "21.02",
        "nama": "Kabupaten Karimun",
        "ibukota": "Tanjung Balai Karimun",
        "provinceCode": "21"
    },
    {
        "kode": "21.03",
        "nama": "Kabupaten Natuna",
        "ibukota": "Ranai",
        "provinceCode": "21"
    },
    {
        "kode": "21.04",
        "nama": "Kabupaten Lingga",
        "ibukota": "Daik",
        "provinceCode": "21"
    },
    {
        "kode": "21.05",
        "nama": "Kabupaten Kepulauan Anambas",
        "ibukota": "Tarempa",
        "provinceCode": "21"
    },
    {
        "kode": "21.71",
        "nama": "Kota Batam",
        "ibukota": "Batam",
        "provinceCode": "21"
    },
    {
        "kode": "21.72",
        "nama": "Kota Tanjung Pinang",
        "ibukota": "Tanjungpinang",
        "provinceCode": "21"
    }
],
  31: [
    {
        "kode": "31.01",
        "nama": "Kabupaten Administrasi Kepulauan Seribu",
        "ibukota": "Pulau Pramuka",
        "provinceCode": "31"
    },
    {
        "kode": "31.71",
        "nama": "Kota Administrasi Jakarta Pusat",
        "ibukota": "Menteng",
        "provinceCode": "31"
    },
    {
        "kode": "31.72",
        "nama": "Kota Administrasi Jakarta Utara",
        "ibukota": "Koja",
        "provinceCode": "31"
    },
    {
        "kode": "31.73",
        "nama": "Kota Administrasi Jakarta Barat",
        "ibukota": "Kembangan",
        "provinceCode": "31"
    },
    {
        "kode": "31.74",
        "nama": "Kota Administrasi Jakarta Selatan",
        "ibukota": "Kebayoran Baru",
        "provinceCode": "31"
    },
    {
        "kode": "31.75",
        "nama": "Kota Administrasi Jakarta Timur",
        "ibukota": "Cakung",
        "provinceCode": "31"
    }
],
  32: [
    {
        "kode": "32.01",
        "nama": "Kabupaten Bogor",
        "ibukota": "Cibinong",
        "provinceCode": "32"
    },
    {
        "kode": "32.02",
        "nama": "Kabupaten Sukabumi",
        "ibukota": "Palabuhanratu",
        "provinceCode": "32"
    },
    {
        "kode": "32.03",
        "nama": "Kabupaten Cianjur",
        "ibukota": "Cianjur",
        "provinceCode": "32"
    },
    {
        "kode": "32.04",
        "nama": "Kabupaten Bandung",
        "ibukota": "Soreang",
        "provinceCode": "32"
    },
    {
        "kode": "32.05",
        "nama": "Kabupaten Garut",
        "ibukota": "Tarogong Kidul",
        "provinceCode": "32"
    },
    {
        "kode": "32.06",
        "nama": "Kabupaten Tasikmalaya",
        "ibukota": "Singaparna",
        "provinceCode": "32"
    },
    {
        "kode": "32.07",
        "nama": "Kabupaten Ciamis",
        "ibukota": "Ciamis",
        "provinceCode": "32"
    },
    {
        "kode": "32.08",
        "nama": "Kabupaten Kuningan",
        "ibukota": "Kuningan",
        "provinceCode": "32"
    },
    {
        "kode": "32.09",
        "nama": "Kabupaten Cirebon",
        "ibukota": "Sumber",
        "provinceCode": "32"
    },
    {
        "kode": "32.10",
        "nama": "Kabupaten Majalengka",
        "ibukota": "Majalengka",
        "provinceCode": "32"
    },
    {
        "kode": "32.11",
        "nama": "Kabupaten Sumedang",
        "ibukota": "Sumedang Utara",
        "provinceCode": "32"
    },
    {
        "kode": "32.12",
        "nama": "Kabupaten Indramayu",
        "ibukota": "Indramayu",
        "provinceCode": "32"
    },
    {
        "kode": "32.13",
        "nama": "Kabupaten Subang",
        "ibukota": "Subang",
        "provinceCode": "32"
    },
    {
        "kode": "32.14",
        "nama": "Kabupaten Purwakarta",
        "ibukota": "Purwakarta",
        "provinceCode": "32"
    },
    {
        "kode": "32.15",
        "nama": "Kabupaten Karawang",
        "ibukota": "Karawang Barat",
        "provinceCode": "32"
    },
    {
        "kode": "32.16",
        "nama": "Kabupaten Bekasi",
        "ibukota": "Cikarang Pusat",
        "provinceCode": "32"
    },
    {
        "kode": "32.17",
        "nama": "Kabupaten Bandung Barat",
        "ibukota": "Ngamprah",
        "provinceCode": "32"
    },
    {
        "kode": "32.18",
        "nama": "Kabupaten Pangandaran",
        "ibukota": "Parigi",
        "provinceCode": "32"
    },
    {
        "kode": "32.71",
        "nama": "Kota Bogor",
        "ibukota": "Bogor",
        "provinceCode": "32"
    },
    {
        "kode": "32.72",
        "nama": "Kota Sukabumi",
        "ibukota": "Sukabumi",
        "provinceCode": "32"
    },
    {
        "kode": "32.73",
        "nama": "Kota Bandung",
        "ibukota": "Bandung",
        "provinceCode": "32"
    },
    {
        "kode": "32.74",
        "nama": "Kota Cirebon",
        "ibukota": "Cirebon",
        "provinceCode": "32"
    },
    {
        "kode": "32.75",
        "nama": "Kota Bekasi",
        "ibukota": "Bekasi",
        "provinceCode": "32"
    },
    {
        "kode": "32.76",
        "nama": "Kota Depok",
        "ibukota": "Depok",
        "provinceCode": "32"
    },
    {
        "kode": "32.77",
        "nama": "Kota Cimahi",
        "ibukota": "Cimahi",
        "provinceCode": "32"
    },
    {
        "kode": "32.78",
        "nama": "Kota Tasikmalaya",
        "ibukota": "Tasikmalaya",
        "provinceCode": "32"
    },
    {
        "kode": "32.79",
        "nama": "Kota Banjar",
        "ibukota": "Banjar",
        "provinceCode": "32"
    }
],
  33: [
    {
        "kode": "33.01",
        "nama": "Kabupaten Cilacap",
        "ibukota": "Cilacap",
        "provinceCode": "33"
    },
    {
        "kode": "33.02",
        "nama": "Kabupaten Banyumas",
        "ibukota": "Purwokerto",
        "provinceCode": "33"
    },
    {
        "kode": "33.03",
        "nama": "Kabupaten Purbalingga",
        "ibukota": "Purbalingga",
        "provinceCode": "33"
    },
    {
        "kode": "33.04",
        "nama": "Kabupaten Banjarnegara",
        "ibukota": "Banjarnegara",
        "provinceCode": "33"
    },
    {
        "kode": "33.05",
        "nama": "Kabupaten Kebumen",
        "ibukota": "Kebumen",
        "provinceCode": "33"
    },
    {
        "kode": "33.06",
        "nama": "Kabupaten Purworejo",
        "ibukota": "Purworejo",
        "provinceCode": "33"
    },
    {
        "kode": "33.07",
        "nama": "Kabupaten Wonosobo",
        "ibukota": "Wonosobo",
        "provinceCode": "33"
    },
    {
        "kode": "33.08",
        "nama": "Kabupaten Magelang",
        "ibukota": "Mungkid",
        "provinceCode": "33"
    },
    {
        "kode": "33.09",
        "nama": "Kabupaten Boyolali",
        "ibukota": "Boyolali",
        "provinceCode": "33"
    },
    {
        "kode": "33.10",
        "nama": "Kabupaten Klaten",
        "ibukota": "Klaten",
        "provinceCode": "33"
    },
    {
        "kode": "33.11",
        "nama": "Kabupaten Sukoharjo",
        "ibukota": "Sukoharjo",
        "provinceCode": "33"
    },
    {
        "kode": "33.12",
        "nama": "Kabupaten Wonogiri",
        "ibukota": "Wonogiri",
        "provinceCode": "33"
    },
    {
        "kode": "33.13",
        "nama": "Kabupaten Karanganyar",
        "ibukota": "Karanganyar",
        "provinceCode": "33"
    },
    {
        "kode": "33.14",
        "nama": "Kabupaten Sragen",
        "ibukota": "Sragen",
        "provinceCode": "33"
    },
    {
        "kode": "33.15",
        "nama": "Kabupaten Grobogan",
        "ibukota": "Purwodadi",
        "provinceCode": "33"
    },
    {
        "kode": "33.16",
        "nama": "Kabupaten Blora",
        "ibukota": "Blora",
        "provinceCode": "33"
    },
    {
        "kode": "33.17",
        "nama": "Kabupaten Rembang",
        "ibukota": "Rembang",
        "provinceCode": "33"
    },
    {
        "kode": "33.18",
        "nama": "Kabupaten Pati",
        "ibukota": "Pati",
        "provinceCode": "33"
    },
    {
        "kode": "33.19",
        "nama": "Kabupaten Kudus",
        "ibukota": "Kudus",
        "provinceCode": "33"
    },
    {
        "kode": "33.20",
        "nama": "Kabupaten Jepara",
        "ibukota": "Jepara",
        "provinceCode": "33"
    },
    {
        "kode": "33.21",
        "nama": "Kabupaten Demak",
        "ibukota": "Demak",
        "provinceCode": "33"
    },
    {
        "kode": "33.22",
        "nama": "Kabupaten Semarang",
        "ibukota": "Ungaran",
        "provinceCode": "33"
    },
    {
        "kode": "33.23",
        "nama": "Kabupaten Temanggung",
        "ibukota": "Temanggung",
        "provinceCode": "33"
    },
    {
        "kode": "33.24",
        "nama": "Kabupaten Kendal",
        "ibukota": "Kendal",
        "provinceCode": "33"
    },
    {
        "kode": "33.25",
        "nama": "Kabupaten Batang",
        "ibukota": "Batang",
        "provinceCode": "33"
    },
    {
        "kode": "33.26",
        "nama": "Kabupaten Pekalongan",
        "ibukota": "Kajen",
        "provinceCode": "33"
    },
    {
        "kode": "33.27",
        "nama": "Kabupaten Pemalang",
        "ibukota": "Pemalang",
        "provinceCode": "33"
    },
    {
        "kode": "33.28",
        "nama": "Kabupaten Tegal",
        "ibukota": "Slawi",
        "provinceCode": "33"
    },
    {
        "kode": "33.29",
        "nama": "Kabupaten Brebes",
        "ibukota": "Brebes",
        "provinceCode": "33"
    },
    {
        "kode": "33.71",
        "nama": "Kota Magelang",
        "ibukota": "Magelang",
        "provinceCode": "33"
    },
    {
        "kode": "33.72",
        "nama": "Kota Surakarta",
        "ibukota": "Surakarta",
        "provinceCode": "33"
    },
    {
        "kode": "33.73",
        "nama": "Kota Salatiga",
        "ibukota": "Salatiga",
        "provinceCode": "33"
    },
    {
        "kode": "33.74",
        "nama": "Kota Semarang",
        "ibukota": "Semarang",
        "provinceCode": "33"
    },
    {
        "kode": "33.75",
        "nama": "Kota Pekalongan",
        "ibukota": "Pekalongan",
        "provinceCode": "33"
    },
    {
        "kode": "33.76",
        "nama": "Kota Tegal",
        "ibukota": "Tegal",
        "provinceCode": "33"
    }
],
  34: [
    {
        "kode": "34.01",
        "nama": "Kabupaten Kulon Progo",
        "ibukota": "Wates",
        "provinceCode": "34"
    },
    {
        "kode": "34.02",
        "nama": "Kabupaten Bantul",
        "ibukota": "Bantul",
        "provinceCode": "34"
    },
    {
        "kode": "34.03",
        "nama": "Kabupaten Gunungkidul",
        "ibukota": "Wonosari",
        "provinceCode": "34"
    },
    {
        "kode": "34.04",
        "nama": "Kabupaten Sleman",
        "ibukota": "Sleman",
        "provinceCode": "34"
    },
    {
        "kode": "34.71",
        "nama": "Kota Yogyakarta",
        "ibukota": "Yogyakarta",
        "provinceCode": "34"
    }
],
  35: [
    {
        "kode": "35.01",
        "nama": "Kabupaten Pacitan",
        "ibukota": "Pacitan",
        "provinceCode": "35"
    },
    {
        "kode": "35.02",
        "nama": "Kabupaten Ponorogo",
        "ibukota": "Ponorogo",
        "provinceCode": "35"
    },
    {
        "kode": "35.03",
        "nama": "Kabupaten Trenggalek",
        "ibukota": "Trenggalek",
        "provinceCode": "35"
    },
    {
        "kode": "35.04",
        "nama": "Kabupaten Tulungagung",
        "ibukota": "Tulungagung",
        "provinceCode": "35"
    },
    {
        "kode": "35.05",
        "nama": "Kabupaten Blitar",
        "ibukota": "Kanigoro",
        "provinceCode": "35"
    },
    {
        "kode": "35.06",
        "nama": "Kabupaten Kediri",
        "ibukota": "Ngasem",
        "provinceCode": "35"
    },
    {
        "kode": "35.07",
        "nama": "Kabupaten Malang",
        "ibukota": "Kepanjen",
        "provinceCode": "35"
    },
    {
        "kode": "35.08",
        "nama": "Kabupaten Lumajang",
        "ibukota": "Lumajang",
        "provinceCode": "35"
    },
    {
        "kode": "35.09",
        "nama": "Kabupaten Jember",
        "ibukota": "Jember",
        "provinceCode": "35"
    },
    {
        "kode": "35.10",
        "nama": "Kabupaten Banyuwangi",
        "ibukota": "Banyuwangi",
        "provinceCode": "35"
    },
    {
        "kode": "35.11",
        "nama": "Kabupaten Bondowoso",
        "ibukota": "Bondowoso",
        "provinceCode": "35"
    },
    {
        "kode": "35.12",
        "nama": "Kabupaten Situbondo",
        "ibukota": "Situbondo",
        "provinceCode": "35"
    },
    {
        "kode": "35.13",
        "nama": "Kabupaten Probolinggo",
        "ibukota": "Kraksaan",
        "provinceCode": "35"
    },
    {
        "kode": "35.14",
        "nama": "Kabupaten Pasuruan",
        "ibukota": "Bangil",
        "provinceCode": "35"
    },
    {
        "kode": "35.15",
        "nama": "Kabupaten Sidoarjo",
        "ibukota": "Sidoarjo",
        "provinceCode": "35"
    },
    {
        "kode": "35.16",
        "nama": "Kabupaten Mojokerto",
        "ibukota": "Mojosari",
        "provinceCode": "35"
    },
    {
        "kode": "35.17",
        "nama": "Kabupaten Jombang",
        "ibukota": "Jombang",
        "provinceCode": "35"
    },
    {
        "kode": "35.18",
        "nama": "Kabupaten Nganjuk",
        "ibukota": "Nganjuk",
        "provinceCode": "35"
    },
    {
        "kode": "35.19",
        "nama": "Kabupaten Madiun",
        "ibukota": "Caruban",
        "provinceCode": "35"
    },
    {
        "kode": "35.20",
        "nama": "Kabupaten Magetan",
        "ibukota": "Magetan",
        "provinceCode": "35"
    },
    {
        "kode": "35.21",
        "nama": "Kabupaten Ngawi",
        "ibukota": "Ngawi",
        "provinceCode": "35"
    },
    {
        "kode": "35.22",
        "nama": "Kabupaten Bojonegoro",
        "ibukota": "Bojonegoro",
        "provinceCode": "35"
    },
    {
        "kode": "35.23",
        "nama": "Kabupaten Tuban",
        "ibukota": "Tuban",
        "provinceCode": "35"
    },
    {
        "kode": "35.24",
        "nama": "Kabupaten Lamongan",
        "ibukota": "Lamongan",
        "provinceCode": "35"
    },
    {
        "kode": "35.25",
        "nama": "Kabupaten Gresik",
        "ibukota": "Gresik",
        "provinceCode": "35"
    },
    {
        "kode": "35.26",
        "nama": "Kabupaten Bangkalan",
        "ibukota": "Bangkalan",
        "provinceCode": "35"
    },
    {
        "kode": "35.27",
        "nama": "Kabupaten Sampang",
        "ibukota": "Sampang",
        "provinceCode": "35"
    },
    {
        "kode": "35.28",
        "nama": "Kabupaten Pamekasan",
        "ibukota": "Pamekasan",
        "provinceCode": "35"
    },
    {
        "kode": "35.29",
        "nama": "Kabupaten Sumenep",
        "ibukota": "Sumenep",
        "provinceCode": "35"
    },
    {
        "kode": "35.71",
        "nama": "Kota Kediri",
        "ibukota": "Kediri",
        "provinceCode": "35"
    },
    {
        "kode": "35.72",
        "nama": "Kota Blitar",
        "ibukota": "Blitar",
        "provinceCode": "35"
    },
    {
        "kode": "35.73",
        "nama": "Kota Malang",
        "ibukota": "Malang",
        "provinceCode": "35"
    },
    {
        "kode": "35.74",
        "nama": "Kota Probolinggo",
        "ibukota": "Probolinggo",
        "provinceCode": "35"
    },
    {
        "kode": "35.75",
        "nama": "Kota Pasuruan",
        "ibukota": "Pasuruan",
        "provinceCode": "35"
    },
    {
        "kode": "35.76",
        "nama": "Kota Mojokerto",
        "ibukota": "Mojokerto",
        "provinceCode": "35"
    },
    {
        "kode": "35.77",
        "nama": "Kota Madiun",
        "ibukota": "Madiun",
        "provinceCode": "35"
    },
    {
        "kode": "35.78",
        "nama": "Kota Surabaya",
        "ibukota": "Surabaya",
        "provinceCode": "35"
    },
    {
        "kode": "35.79",
        "nama": "Kota Batu",
        "ibukota": "Batu",
        "provinceCode": "35"
    }
],
  36: [
    {
        "kode": "36.01",
        "nama": "Kabupaten Pandeglang",
        "ibukota": "Pandeglang",
        "provinceCode": "36"
    },
    {
        "kode": "36.02",
        "nama": "Kabupaten Lebak",
        "ibukota": "Rangkasbitung",
        "provinceCode": "36"
    },
    {
        "kode": "36.03",
        "nama": "Kabupaten Tangerang",
        "ibukota": "Tigaraksa",
        "provinceCode": "36"
    },
    {
        "kode": "36.04",
        "nama": "Kabupaten Serang",
        "ibukota": "Ciruas",
        "provinceCode": "36"
    },
    {
        "kode": "36.71",
        "nama": "Kota Tangerang",
        "ibukota": "Tangerang",
        "provinceCode": "36"
    },
    {
        "kode": "36.72",
        "nama": "Kota Cilegon",
        "ibukota": "Cilegon",
        "provinceCode": "36"
    },
    {
        "kode": "36.73",
        "nama": "Kota Serang",
        "ibukota": "Serang",
        "provinceCode": "36"
    },
    {
        "kode": "36.74",
        "nama": "Kota Tangerang Selatan",
        "ibukota": "Tangerang Selatan",
        "provinceCode": "36"
    }
],
  51: [
    {
        "kode": "51.01",
        "nama": "Kabupaten Jembrana",
        "ibukota": "Negara",
        "provinceCode": "51"
    },
    {
        "kode": "51.02",
        "nama": "Kabupaten Tabanan",
        "ibukota": "Tabanan",
        "provinceCode": "51"
    },
    {
        "kode": "51.03",
        "nama": "Kabupaten Badung",
        "ibukota": "Mangupura",
        "provinceCode": "51"
    },
    {
        "kode": "51.04",
        "nama": "Kabupaten Gianyar",
        "ibukota": "Gianyar",
        "provinceCode": "51"
    },
    {
        "kode": "51.05",
        "nama": "Kabupaten Klungkung",
        "ibukota": "Semarapura",
        "provinceCode": "51"
    },
    {
        "kode": "51.06",
        "nama": "Kabupaten Bangli",
        "ibukota": "Bangli",
        "provinceCode": "51"
    },
    {
        "kode": "51.07",
        "nama": "Kabupaten Karangasem",
        "ibukota": "Amlapura",
        "provinceCode": "51"
    },
    {
        "kode": "51.08",
        "nama": "Kabupaten Buleleng",
        "ibukota": "Singaraja",
        "provinceCode": "51"
    },
    {
        "kode": "51.71",
        "nama": "Kota Denpasar",
        "ibukota": "Denpasar",
        "provinceCode": "51"
    }
],
  52: [
    {
        "kode": "52.01",
        "nama": "Kabupaten Lombok Barat",
        "ibukota": "Gerung",
        "provinceCode": "52"
    },
    {
        "kode": "52.02",
        "nama": "Kabupaten Lombok Tengah",
        "ibukota": "Praya",
        "provinceCode": "52"
    },
    {
        "kode": "52.03",
        "nama": "Kabupaten Lombok Timur",
        "ibukota": "Selong",
        "provinceCode": "52"
    },
    {
        "kode": "52.04",
        "nama": "Kabupaten Sumbawa",
        "ibukota": "Sumbawa Besar",
        "provinceCode": "52"
    },
    {
        "kode": "52.05",
        "nama": "Kabupaten Dompu",
        "ibukota": "Dompu",
        "provinceCode": "52"
    },
    {
        "kode": "52.06",
        "nama": "Kabupaten Bima",
        "ibukota": "Woha",
        "provinceCode": "52"
    },
    {
        "kode": "52.07",
        "nama": "Kabupaten Sumbawa Barat",
        "ibukota": "Taliwang",
        "provinceCode": "52"
    },
    {
        "kode": "52.08",
        "nama": "Kabupaten Lombok Utara",
        "ibukota": "Tanjung",
        "provinceCode": "52"
    },
    {
        "kode": "52.71",
        "nama": "Kota Mataram",
        "ibukota": "Mataram",
        "provinceCode": "52"
    },
    {
        "kode": "52.72",
        "nama": "Kota Bima",
        "ibukota": "Bima",
        "provinceCode": "52"
    }
],
  53: [
    {
        "kode": "53.01",
        "nama": "Kabupaten Kupang",
        "ibukota": "Oelamasi",
        "provinceCode": "53"
    },
    {
        "kode": "53.02",
        "nama": "Kabupaten Timor Tengah Selatan",
        "ibukota": "Soe",
        "provinceCode": "53"
    },
    {
        "kode": "53.03",
        "nama": "Kabupaten Timor Tengah Utara",
        "ibukota": "Kefamenanu",
        "provinceCode": "53"
    },
    {
        "kode": "53.04",
        "nama": "Kabupaten Belu",
        "ibukota": "Atambua",
        "provinceCode": "53"
    },
    {
        "kode": "53.05",
        "nama": "Kabupaten Alor",
        "ibukota": "Kalabahi",
        "provinceCode": "53"
    },
    {
        "kode": "53.06",
        "nama": "Kabupaten Flores Timur",
        "ibukota": "Larantuka",
        "provinceCode": "53"
    },
    {
        "kode": "53.07",
        "nama": "Kabupaten Sikka",
        "ibukota": "Maumere",
        "provinceCode": "53"
    },
    {
        "kode": "53.08",
        "nama": "Kabupaten Ende",
        "ibukota": "Ende",
        "provinceCode": "53"
    },
    {
        "kode": "53.09",
        "nama": "Kabupaten Ngada",
        "ibukota": "Bajawa",
        "provinceCode": "53"
    },
    {
        "kode": "53.10",
        "nama": "Kabupaten Manggarai",
        "ibukota": "Ruteng",
        "provinceCode": "53"
    },
    {
        "kode": "53.11",
        "nama": "Kabupaten Sumba Timur",
        "ibukota": "Waingapu",
        "provinceCode": "53"
    },
    {
        "kode": "53.12",
        "nama": "Kabupaten Sumba Barat",
        "ibukota": "Waikabubak",
        "provinceCode": "53"
    },
    {
        "kode": "53.13",
        "nama": "Kabupaten Lembata",
        "ibukota": "Lewoleba",
        "provinceCode": "53"
    },
    {
        "kode": "53.14",
        "nama": "Kabupaten Rote Ndao",
        "ibukota": "Baa",
        "provinceCode": "53"
    },
    {
        "kode": "53.15",
        "nama": "Kabupaten Manggarai Barat",
        "ibukota": "Labuan Bajo",
        "provinceCode": "53"
    },
    {
        "kode": "53.16",
        "nama": "Kabupaten Nagekeo",
        "ibukota": "Mbay",
        "provinceCode": "53"
    },
    {
        "kode": "53.17",
        "nama": "Kabupaten Sumba Tengah",
        "ibukota": "Waibakul",
        "provinceCode": "53"
    },
    {
        "kode": "53.18",
        "nama": "Kabupaten Sumba Barat Daya",
        "ibukota": "Tambolaka",
        "provinceCode": "53"
    },
    {
        "kode": "53.19",
        "nama": "Kabupaten Manggarai Timur",
        "ibukota": "Borong",
        "provinceCode": "53"
    },
    {
        "kode": "53.20",
        "nama": "Kabupaten Sabu Raijua",
        "ibukota": "Seba",
        "provinceCode": "53"
    },
    {
        "kode": "53.21",
        "nama": "Kabupaten Malaka",
        "ibukota": "Betun",
        "provinceCode": "53"
    },
    {
        "kode": "53.71",
        "nama": "Kota Kupang",
        "ibukota": "Kupang",
        "provinceCode": "53"
    }
],
  61: [
    {
        "kode": "61.01",
        "nama": "Kabupaten Sambas",
        "ibukota": "Sambas",
        "provinceCode": "61"
    },
    {
        "kode": "61.02",
        "nama": "Kabupaten Mempawah",
        "ibukota": "Mempawah",
        "provinceCode": "61"
    },
    {
        "kode": "61.03",
        "nama": "Kabupaten Sanggau",
        "ibukota": "Sanggau",
        "provinceCode": "61"
    },
    {
        "kode": "61.04",
        "nama": "Kabupaten Ketapang",
        "ibukota": "Ketapang",
        "provinceCode": "61"
    },
    {
        "kode": "61.05",
        "nama": "Kabupaten Sintang",
        "ibukota": "Sintang",
        "provinceCode": "61"
    },
    {
        "kode": "61.06",
        "nama": "Kabupaten Kapuas Hulu",
        "ibukota": "Putussibau",
        "provinceCode": "61"
    },
    {
        "kode": "61.07",
        "nama": "Kabupaten Bengkayang",
        "ibukota": "Bengkayang",
        "provinceCode": "61"
    },
    {
        "kode": "61.08",
        "nama": "Kabupaten Landak",
        "ibukota": "Ngabang",
        "provinceCode": "61"
    },
    {
        "kode": "61.09",
        "nama": "Kabupaten Sekadau",
        "ibukota": "Sekadau",
        "provinceCode": "61"
    },
    {
        "kode": "61.10",
        "nama": "Kabupaten Melawi",
        "ibukota": "Nanga Pinoh",
        "provinceCode": "61"
    },
    {
        "kode": "61.11",
        "nama": "Kabupaten Kayong Utara",
        "ibukota": "Sukadana",
        "provinceCode": "61"
    },
    {
        "kode": "61.12",
        "nama": "Kabupaten Kubu Raya",
        "ibukota": "Sungai Raya",
        "provinceCode": "61"
    },
    {
        "kode": "61.71",
        "nama": "Kota Pontianak",
        "ibukota": "Pontianak",
        "provinceCode": "61"
    },
    {
        "kode": "61.72",
        "nama": "Kota Singkawang",
        "ibukota": "Singkawang",
        "provinceCode": "61"
    }
],
  62: [
    {
        "kode": "62.01",
        "nama": "Kabupaten Kotawaringin Barat",
        "ibukota": "Pangkalan Bun",
        "provinceCode": "62"
    },
    {
        "kode": "62.02",
        "nama": "Kabupaten Kotawaringin Timur",
        "ibukota": "Sampit",
        "provinceCode": "62"
    },
    {
        "kode": "62.03",
        "nama": "Kabupaten Kapuas",
        "ibukota": "Kuala Kapuas",
        "provinceCode": "62"
    },
    {
        "kode": "62.04",
        "nama": "Kabupaten Barito Selatan",
        "ibukota": "Buntok",
        "provinceCode": "62"
    },
    {
        "kode": "62.05",
        "nama": "Kabupaten Barito Utara",
        "ibukota": "Muara Teweh",
        "provinceCode": "62"
    },
    {
        "kode": "62.06",
        "nama": "Kabupaten Katingan",
        "ibukota": "Kasongan",
        "provinceCode": "62"
    },
    {
        "kode": "62.07",
        "nama": "Kabupaten Seruyan",
        "ibukota": "Kuala Pembuang",
        "provinceCode": "62"
    },
    {
        "kode": "62.08",
        "nama": "Kabupaten Sukamara",
        "ibukota": "Sukamara",
        "provinceCode": "62"
    },
    {
        "kode": "62.09",
        "nama": "Kabupaten Lamandau",
        "ibukota": "Nanga Bulik",
        "provinceCode": "62"
    },
    {
        "kode": "62.10",
        "nama": "Kabupaten Gunung Mas",
        "ibukota": "Kuala Kurun",
        "provinceCode": "62"
    },
    {
        "kode": "62.11",
        "nama": "Kabupaten Pulang Pisau",
        "ibukota": "Pulang Pisau",
        "provinceCode": "62"
    },
    {
        "kode": "62.12",
        "nama": "Kabupaten Murung Raya",
        "ibukota": "Puruk Cahu",
        "provinceCode": "62"
    },
    {
        "kode": "62.13",
        "nama": "Kabupaten Barito Timur",
        "ibukota": "Tamiang Layang",
        "provinceCode": "62"
    },
    {
        "kode": "62.71",
        "nama": "Kota Palangkaraya",
        "ibukota": "Palangka Raya",
        "provinceCode": "62"
    }
],
  63: [
    {
        "kode": "63.01",
        "nama": "Kabupaten Tanah Laut",
        "ibukota": "Pelaihari",
        "provinceCode": "63"
    },
    {
        "kode": "63.02",
        "nama": "Kabupaten Kotabaru",
        "ibukota": "Kotabaru",
        "provinceCode": "63"
    },
    {
        "kode": "63.03",
        "nama": "Kabupaten Banjar",
        "ibukota": "Martapura",
        "provinceCode": "63"
    },
    {
        "kode": "63.04",
        "nama": "Kabupaten Barito Kuala",
        "ibukota": "Marabahan",
        "provinceCode": "63"
    },
    {
        "kode": "63.05",
        "nama": "Kabupaten Tapin",
        "ibukota": "Rantau",
        "provinceCode": "63"
    },
    {
        "kode": "63.06",
        "nama": "Kabupaten Hulu Sungai Selatan",
        "ibukota": "Kandangan",
        "provinceCode": "63"
    },
    {
        "kode": "63.07",
        "nama": "Kabupaten Hulu Sungai Tengah",
        "ibukota": "Barabai",
        "provinceCode": "63"
    },
    {
        "kode": "63.08",
        "nama": "Kabupaten Hulu Sungai Utara",
        "ibukota": "Amuntai",
        "provinceCode": "63"
    },
    {
        "kode": "63.09",
        "nama": "Kabupaten Tabalong",
        "ibukota": "Tanjung",
        "provinceCode": "63"
    },
    {
        "kode": "63.10",
        "nama": "Kabupaten Tanah Bumbu",
        "ibukota": "Batulicin",
        "provinceCode": "63"
    },
    {
        "kode": "63.11",
        "nama": "Kabupaten Balangan",
        "ibukota": "Paringin",
        "provinceCode": "63"
    },
    {
        "kode": "63.71",
        "nama": "Kota Banjarmasin",
        "ibukota": "Banjarmasin",
        "provinceCode": "63"
    },
    {
        "kode": "63.72",
        "nama": "Kota Banjarbaru",
        "ibukota": "Banjarbaru",
        "provinceCode": "63"
    }
],
  64: [
    {
        "kode": "64.01",
        "nama": "Kabupaten Paser",
        "ibukota": "Tana Paser",
        "provinceCode": "64"
    },
    {
        "kode": "64.02",
        "nama": "Kabupaten Kutai Kartanegara",
        "ibukota": "Tenggarong",
        "provinceCode": "64"
    },
    {
        "kode": "64.03",
        "nama": "Kabupaten Berau",
        "ibukota": "Tanjung Redeb",
        "provinceCode": "64"
    },
    {
        "kode": "64.07",
        "nama": "Kabupaten Kutai Barat",
        "ibukota": "Sendawar",
        "provinceCode": "64"
    },
    {
        "kode": "64.08",
        "nama": "Kabupaten Kutai Timur",
        "ibukota": "Sangatta",
        "provinceCode": "64"
    },
    {
        "kode": "64.09",
        "nama": "Kabupaten Penajam Paser Utara",
        "ibukota": "Penajam",
        "provinceCode": "64"
    },
    {
        "kode": "64.11",
        "nama": "Kabupaten Mahakam Ulu",
        "ibukota": "Ujoh Bilang",
        "provinceCode": "64"
    },
    {
        "kode": "64.71",
        "nama": "Kota Balikpapan",
        "ibukota": "Balikpapan",
        "provinceCode": "64"
    },
    {
        "kode": "64.72",
        "nama": "Kota Samarinda",
        "ibukota": "Samarinda",
        "provinceCode": "64"
    },
    {
        "kode": "64.74",
        "nama": "Kota Bontang",
        "ibukota": "Bontang",
        "provinceCode": "64"
    }
],
  65: [
    {
        "kode": "65.01",
        "nama": "Kabupaten Bulungan",
        "ibukota": "Tanjung Selor",
        "provinceCode": "65"
    },
    {
        "kode": "65.02",
        "nama": "Kabupaten Malinau",
        "ibukota": "Malinau",
        "provinceCode": "65"
    },
    {
        "kode": "65.03",
        "nama": "Kabupaten Nunukan",
        "ibukota": "Nunukan",
        "provinceCode": "65"
    },
    {
        "kode": "65.04",
        "nama": "Kabupaten Tana Tidung",
        "ibukota": "Tideng Pale",
        "provinceCode": "65"
    },
    {
        "kode": "65.71",
        "nama": "Kota Tarakan",
        "ibukota": "Tarakan",
        "provinceCode": "65"
    }
],
  71: [
    {
        "kode": "71.01",
        "nama": "Kabupaten Bolaang Mongondow",
        "ibukota": "Lolak",
        "provinceCode": "71"
    },
    {
        "kode": "71.02",
        "nama": "Kabupaten Minahasa",
        "ibukota": "Tondano",
        "provinceCode": "71"
    },
    {
        "kode": "71.03",
        "nama": "Kabupaten Kepulauan Sangihe",
        "ibukota": "Tahuna",
        "provinceCode": "71"
    },
    {
        "kode": "71.04",
        "nama": "Kabupaten Kepulauan Talaud",
        "ibukota": "Melonguane",
        "provinceCode": "71"
    },
    {
        "kode": "71.05",
        "nama": "Kabupaten Minahasa Selatan",
        "ibukota": "Amurang",
        "provinceCode": "71"
    },
    {
        "kode": "71.06",
        "nama": "Kabupaten Minahasa Utara",
        "ibukota": "Airmadidi",
        "provinceCode": "71"
    },
    {
        "kode": "71.07",
        "nama": "Kabupaten Minahasa Tenggara",
        "ibukota": "Ratahan",
        "provinceCode": "71"
    },
    {
        "kode": "71.08",
        "nama": "Kabupaten Bolaang Mongondow Utara",
        "ibukota": "Boroko",
        "provinceCode": "71"
    },
    {
        "kode": "71.09",
        "nama": "Kabupaten Kep. Siau Tagulandang Biaro",
        "ibukota": "Ondong Siau",
        "provinceCode": "71"
    },
    {
        "kode": "71.10",
        "nama": "Kabupaten Bolaang Mongondow Timur",
        "ibukota": "Tutuyan",
        "provinceCode": "71"
    },
    {
        "kode": "71.11",
        "nama": "Kabupaten Bolaang Mongondow Selatan",
        "ibukota": "Molibagu",
        "provinceCode": "71"
    },
    {
        "kode": "71.71",
        "nama": "Kota Manado",
        "ibukota": "Manado",
        "provinceCode": "71"
    },
    {
        "kode": "71.72",
        "nama": "Kota Bitung",
        "ibukota": "Bitung",
        "provinceCode": "71"
    },
    {
        "kode": "71.73",
        "nama": "Kota Tomohon",
        "ibukota": "Tomohon",
        "provinceCode": "71"
    },
    {
        "kode": "71.74",
        "nama": "Kota Kotamobagu",
        "ibukota": "Kotamobagu",
        "provinceCode": "71"
    }
],
  72: [
    {
        "kode": "72.01",
        "nama": "Kabupaten Banggai",
        "ibukota": "Luwuk",
        "provinceCode": "72"
    },
    {
        "kode": "72.02",
        "nama": "Kabupaten Poso",
        "ibukota": "Poso",
        "provinceCode": "72"
    },
    {
        "kode": "72.03",
        "nama": "Kabupaten Donggala",
        "ibukota": "Banawa",
        "provinceCode": "72"
    },
    {
        "kode": "72.04",
        "nama": "Kabupaten Toli-Toli",
        "ibukota": "Tolitoli",
        "provinceCode": "72"
    },
    {
        "kode": "72.05",
        "nama": "Kabupaten Buol",
        "ibukota": "Buol",
        "provinceCode": "72"
    },
    {
        "kode": "72.06",
        "nama": "Kabupaten Morowali",
        "ibukota": "Bungku",
        "provinceCode": "72"
    },
    {
        "kode": "72.07",
        "nama": "Kabupaten Banggai Kepulauan",
        "ibukota": "Salakan",
        "provinceCode": "72"
    },
    {
        "kode": "72.08",
        "nama": "Kabupaten Parigi Moutong",
        "ibukota": "Parigi",
        "provinceCode": "72"
    },
    {
        "kode": "72.09",
        "nama": "Kabupaten Tojo Una Una",
        "ibukota": "Ampana",
        "provinceCode": "72"
    },
    {
        "kode": "72.10",
        "nama": "Kabupaten Sigi",
        "ibukota": "Sigi Biromaru",
        "provinceCode": "72"
    },
    {
        "kode": "72.11",
        "nama": "Kabupaten Banggai Laut",
        "ibukota": "Banggai",
        "provinceCode": "72"
    },
    {
        "kode": "72.12",
        "nama": "Kabupaten Morowali Utara",
        "ibukota": "Kolonodale",
        "provinceCode": "72"
    },
    {
        "kode": "72.71",
        "nama": "Kota Palu",
        "ibukota": "Palu",
        "provinceCode": "72"
    }
],
  73: [
    {
        "kode": "73.01",
        "nama": "Kabupaten Kepulauan Selayar",
        "ibukota": "Benteng",
        "provinceCode": "73"
    },
    {
        "kode": "73.02",
        "nama": "Kabupaten Bulukumba",
        "ibukota": "Bulukumba",
        "provinceCode": "73"
    },
    {
        "kode": "73.03",
        "nama": "Kabupaten Bantaeng",
        "ibukota": "Bantaeng",
        "provinceCode": "73"
    },
    {
        "kode": "73.04",
        "nama": "Kabupaten Jeneponto",
        "ibukota": "Bontosunggu",
        "provinceCode": "73"
    },
    {
        "kode": "73.05",
        "nama": "Kabupaten Takalar",
        "ibukota": "Pattallassang",
        "provinceCode": "73"
    },
    {
        "kode": "73.06",
        "nama": "Kabupaten Gowa",
        "ibukota": "Sungguminasa",
        "provinceCode": "73"
    },
    {
        "kode": "73.07",
        "nama": "Kabupaten Sinjai",
        "ibukota": "Balangnipa",
        "provinceCode": "73"
    },
    {
        "kode": "73.08",
        "nama": "Kabupaten Bone",
        "ibukota": "Watampone",
        "provinceCode": "73"
    },
    {
        "kode": "73.09",
        "nama": "Kabupaten Maros",
        "ibukota": "Turikale",
        "provinceCode": "73"
    },
    {
        "kode": "73.10",
        "nama": "Kabupaten Pangkajene dan Kepulauan",
        "ibukota": "Pangkajene",
        "provinceCode": "73"
    },
    {
        "kode": "73.11",
        "nama": "Kabupaten Barru",
        "ibukota": "Barru",
        "provinceCode": "73"
    },
    {
        "kode": "73.12",
        "nama": "Kabupaten Soppeng",
        "ibukota": "Watansoppeng",
        "provinceCode": "73"
    },
    {
        "kode": "73.13",
        "nama": "Kabupaten Wajo",
        "ibukota": "Sengkang",
        "provinceCode": "73"
    },
    {
        "kode": "73.14",
        "nama": "Kabupaten Sidenreng Rappang",
        "ibukota": "Pangkajene Sidenreng",
        "provinceCode": "73"
    },
    {
        "kode": "73.15",
        "nama": "Kabupaten Pinrang",
        "ibukota": "Pinrang",
        "provinceCode": "73"
    },
    {
        "kode": "73.16",
        "nama": "Kabupaten Enrekang",
        "ibukota": "Enrekang",
        "provinceCode": "73"
    },
    {
        "kode": "73.17",
        "nama": "Kabupaten Luwu",
        "ibukota": "Belopa",
        "provinceCode": "73"
    },
    {
        "kode": "73.18",
        "nama": "Kabupaten Tana Toraja",
        "ibukota": "Makale",
        "provinceCode": "73"
    },
    {
        "kode": "73.22",
        "nama": "Kabupaten Luwu Utara",
        "ibukota": "Masamba",
        "provinceCode": "73"
    },
    {
        "kode": "73.24",
        "nama": "Kabupaten Luwu Timur",
        "ibukota": "Malili",
        "provinceCode": "73"
    },
    {
        "kode": "73.26",
        "nama": "Kabupaten Toraja Utara",
        "ibukota": "Rantepao",
        "provinceCode": "73"
    },
    {
        "kode": "73.71",
        "nama": "Kota Makassar",
        "ibukota": "Makassar",
        "provinceCode": "73"
    },
    {
        "kode": "73.72",
        "nama": "Kota Parepare",
        "ibukota": "Parepare",
        "provinceCode": "73"
    },
    {
        "kode": "73.73",
        "nama": "Kota Palopo",
        "ibukota": "Palopo",
        "provinceCode": "73"
    }
],
  74: [
    {
        "kode": "74.01",
        "nama": "Kabupaten Kolaka",
        "ibukota": "Kolaka",
        "provinceCode": "74"
    },
    {
        "kode": "74.02",
        "nama": "Kabupaten Konawe",
        "ibukota": "Unaaha",
        "provinceCode": "74"
    },
    {
        "kode": "74.03",
        "nama": "Kabupaten Muna",
        "ibukota": "Raha",
        "provinceCode": "74"
    },
    {
        "kode": "74.04",
        "nama": "Kabupaten Buton",
        "ibukota": "Pasarwajo",
        "provinceCode": "74"
    },
    {
        "kode": "74.05",
        "nama": "Kabupaten Konawe Selatan",
        "ibukota": "Andolo",
        "provinceCode": "74"
    },
    {
        "kode": "74.06",
        "nama": "Kabupaten Bombana",
        "ibukota": "Rumbia",
        "provinceCode": "74"
    },
    {
        "kode": "74.07",
        "nama": "Kabupaten Wakatobi",
        "ibukota": "Wangi-Wangi",
        "provinceCode": "74"
    },
    {
        "kode": "74.08",
        "nama": "Kabupaten Kolaka Utara",
        "ibukota": "Lasusua",
        "provinceCode": "74"
    },
    {
        "kode": "74.09",
        "nama": "Kabupaten Konawe Utara",
        "ibukota": "Wanggudu",
        "provinceCode": "74"
    },
    {
        "kode": "74.10",
        "nama": "Kabupaten Buton Utara",
        "ibukota": "Buranga",
        "provinceCode": "74"
    },
    {
        "kode": "74.11",
        "nama": "Kabupaten Kolaka Timur",
        "ibukota": "Tirawuta",
        "provinceCode": "74"
    },
    {
        "kode": "74.12",
        "nama": "Kabupaten Konawe Kepulauan",
        "ibukota": "Langara",
        "provinceCode": "74"
    },
    {
        "kode": "74.13",
        "nama": "Kabupaten Muna Barat",
        "ibukota": "Sawerigadi",
        "provinceCode": "74"
    },
    {
        "kode": "74.14",
        "nama": "Kabupaten Buton Tengah",
        "ibukota": "Labungkari",
        "provinceCode": "74"
    },
    {
        "kode": "74.15",
        "nama": "Kabupaten Buton Selatan",
        "ibukota": "Batauga",
        "provinceCode": "74"
    },
    {
        "kode": "74.71",
        "nama": "Kota Kendari",
        "ibukota": "Kendari",
        "provinceCode": "74"
    },
    {
        "kode": "74.72",
        "nama": "Kota Bau Bau",
        "ibukota": "Bau-Bau",
        "provinceCode": "74"
    }
],
  75: [
    {
        "kode": "75.01",
        "nama": "Kabupaten Gorontalo",
        "ibukota": "Limboto",
        "provinceCode": "75"
    },
    {
        "kode": "75.02",
        "nama": "Kabupaten Boalemo",
        "ibukota": "Tilamuta",
        "provinceCode": "75"
    },
    {
        "kode": "75.03",
        "nama": "Kabupaten Bone Bolango",
        "ibukota": "Suwawa",
        "provinceCode": "75"
    },
    {
        "kode": "75.04",
        "nama": "Kabupaten Pohuwato",
        "ibukota": "Marisa",
        "provinceCode": "75"
    },
    {
        "kode": "75.05",
        "nama": "Kabupaten Gorontalo Utara",
        "ibukota": "Kwandang",
        "provinceCode": "75"
    },
    {
        "kode": "75.71",
        "nama": "Kota Gorontalo",
        "ibukota": "Gorontalo",
        "provinceCode": "75"
    }
],
  76: [
    {
        "kode": "76.01",
        "nama": "Kabupaten Pasangkayu",
        "ibukota": "Pasangkayu",
        "provinceCode": "76"
    },
    {
        "kode": "76.02",
        "nama": "Kabupaten Mamuju",
        "ibukota": "Mamuju",
        "provinceCode": "76"
    },
    {
        "kode": "76.03",
        "nama": "Kabupaten Mamasa",
        "ibukota": "Mamasa",
        "provinceCode": "76"
    },
    {
        "kode": "76.04",
        "nama": "Kabupaten Polewali Mandar",
        "ibukota": "Polewali",
        "provinceCode": "76"
    },
    {
        "kode": "76.05",
        "nama": "Kabupaten Majene",
        "ibukota": "Banggae",
        "provinceCode": "76"
    },
    {
        "kode": "76.06",
        "nama": "Kabupaten Mamuju Tengah",
        "ibukota": "Tobadak",
        "provinceCode": "76"
    }
],
  81: [
    {
        "kode": "81.01",
        "nama": "Kabupaten Maluku Tengah",
        "ibukota": "Masohi",
        "provinceCode": "81"
    },
    {
        "kode": "81.02",
        "nama": "Kabupaten Maluku Tenggara",
        "ibukota": "Langgur",
        "provinceCode": "81"
    },
    {
        "kode": "81.03",
        "nama": "Kabupaten Kepulauan Tanimbar",
        "ibukota": "",
        "provinceCode": "81"
    },
    {
        "kode": "81.04",
        "nama": "Kabupaten Buru",
        "ibukota": "Namlea",
        "provinceCode": "81"
    },
    {
        "kode": "81.05",
        "nama": "Kabupaten Seram Bagian Timur",
        "ibukota": "Bula",
        "provinceCode": "81"
    },
    {
        "kode": "81.06",
        "nama": "Kabupaten Seram Bagian Barat",
        "ibukota": "Piru",
        "provinceCode": "81"
    },
    {
        "kode": "81.07",
        "nama": "Kabupaten Kepulauan Aru",
        "ibukota": "Dobo",
        "provinceCode": "81"
    },
    {
        "kode": "81.08",
        "nama": "Kabupaten Maluku Barat Daya",
        "ibukota": "Tiakur",
        "provinceCode": "81"
    },
    {
        "kode": "81.09",
        "nama": "Kabupaten Buru Selatan",
        "ibukota": "Namrole",
        "provinceCode": "81"
    },
    {
        "kode": "81.71",
        "nama": "Kota Ambon",
        "ibukota": "Ambon",
        "provinceCode": "81"
    },
    {
        "kode": "81.72",
        "nama": "Kota Tual",
        "ibukota": "Tual",
        "provinceCode": "81"
    }
],
  82: [
    {
        "kode": "82.01",
        "nama": "Kabupaten Halmahera Barat",
        "ibukota": "Jailolo",
        "provinceCode": "82"
    },
    {
        "kode": "82.02",
        "nama": "Kabupaten Halmahera Tengah",
        "ibukota": "Weda",
        "provinceCode": "82"
    },
    {
        "kode": "82.03",
        "nama": "Kabupaten Halmahera Utara",
        "ibukota": "Tobelo",
        "provinceCode": "82"
    },
    {
        "kode": "82.04",
        "nama": "Kabupaten Halmahera Selatan",
        "ibukota": "Labuha",
        "provinceCode": "82"
    },
    {
        "kode": "82.05",
        "nama": "Kabupaten Kepulauan Sula",
        "ibukota": "Sanana",
        "provinceCode": "82"
    },
    {
        "kode": "82.06",
        "nama": "Kabupaten Halmahera Timur",
        "ibukota": "Maba",
        "provinceCode": "82"
    },
    {
        "kode": "82.07",
        "nama": "Kabupaten Pulau Morotai",
        "ibukota": "Daruba",
        "provinceCode": "82"
    },
    {
        "kode": "82.08",
        "nama": "Kabupaten Pulau Taliabu",
        "ibukota": "Bobong",
        "provinceCode": "82"
    },
    {
        "kode": "82.71",
        "nama": "Kota Ternate",
        "ibukota": "Ternate",
        "provinceCode": "82"
    },
    {
        "kode": "82.72",
        "nama": "Kota Tidore Kepulauan",
        "ibukota": "Tidore Kepulauan",
        "provinceCode": "82"
    }
],
  91: [
    {
        "kode": "91.03",
        "nama": "Kabupaten Jayapura",
        "ibukota": "Sentani",
        "provinceCode": "91"
    },
    {
        "kode": "91.05",
        "nama": "Kabupaten Kepulauan Yapen",
        "ibukota": "Serui",
        "provinceCode": "91"
    },
    {
        "kode": "91.06",
        "nama": "Kabupaten Biak Numfor",
        "ibukota": "Biak",
        "provinceCode": "91"
    },
    {
        "kode": "91.10",
        "nama": "Kabupaten Sarmi",
        "ibukota": "Sarmi",
        "provinceCode": "91"
    },
    {
        "kode": "91.11",
        "nama": "Kabupaten Keerom",
        "ibukota": "Waris",
        "provinceCode": "91"
    },
    {
        "kode": "91.15",
        "nama": "Kabupaten Waropen",
        "ibukota": "Botawa",
        "provinceCode": "91"
    },
    {
        "kode": "91.19",
        "nama": "Kabupaten Supiori",
        "ibukota": "Sorendiweri",
        "provinceCode": "91"
    },
    {
        "kode": "91.20",
        "nama": "Kabupaten Mamberamo Raya",
        "ibukota": "Burmeso",
        "provinceCode": "91"
    },
    {
        "kode": "91.71",
        "nama": "Kota Jayapura",
        "ibukota": "Jayapura",
        "provinceCode": "91"
    }
],
  92: [
    {
        "kode": "92.02",
        "nama": "Kabupaten Manokwari",
        "ibukota": "Manokwari",
        "provinceCode": "92"
    },
    {
        "kode": "92.03",
        "nama": "Kabupaten Fak Fak",
        "ibukota": "Fakfak",
        "provinceCode": "92"
    },
    {
        "kode": "92.06",
        "nama": "Kabupaten Teluk Bintuni",
        "ibukota": "Bintuni",
        "provinceCode": "92"
    },
    {
        "kode": "92.07",
        "nama": "Kabupaten Teluk Wondama",
        "ibukota": "Rasiei",
        "provinceCode": "92"
    },
    {
        "kode": "92.08",
        "nama": "Kabupaten Kaimana",
        "ibukota": "Kaimana",
        "provinceCode": "92"
    },
    {
        "kode": "92.11",
        "nama": "Kabupaten Manokwari Selatan",
        "ibukota": "Ransiki",
        "provinceCode": "92"
    },
    {
        "kode": "92.12",
        "nama": "Kabupaten Pegunungan Arfak",
        "ibukota": "Anggi",
        "provinceCode": "92"
    }
],
  93: [
    {
        "kode": "93.01",
        "nama": "Kabupaten Merauke",
        "ibukota": "Merauke",
        "provinceCode": "93"
    },
    {
        "kode": "93.02",
        "nama": "Kabupaten Boven Digoel",
        "ibukota": "Tanah Merah",
        "provinceCode": "93"
    },
    {
        "kode": "93.03",
        "nama": "Kabupaten Mappi",
        "ibukota": "Kepi",
        "provinceCode": "93"
    },
    {
        "kode": "93.04",
        "nama": "Kabupaten Asmat",
        "ibukota": "Agats",
        "provinceCode": "93"
    }
],
  94: [
    {
        "kode": "94.01",
        "nama": "Kabupaten Nabire",
        "ibukota": "Nabire",
        "provinceCode": "94"
    },
    {
        "kode": "94.02",
        "nama": "Kabupaten Puncak Jaya",
        "ibukota": "Mulia",
        "provinceCode": "94"
    },
    {
        "kode": "94.03",
        "nama": "Kabupaten Paniai",
        "ibukota": "Enarotali",
        "provinceCode": "94"
    },
    {
        "kode": "94.04",
        "nama": "Kabupaten Mimika",
        "ibukota": "Timika",
        "provinceCode": "94"
    },
    {
        "kode": "94.05",
        "nama": "Kabupaten Puncak",
        "ibukota": "Ilaga",
        "provinceCode": "94"
    },
    {
        "kode": "94.06",
        "nama": "Kabupaten Dogiyai",
        "ibukota": "Kigamani",
        "provinceCode": "94"
    },
    {
        "kode": "94.07",
        "nama": "Kabupaten Intan Jaya",
        "ibukota": "Sugapa",
        "provinceCode": "94"
    },
    {
        "kode": "94.08",
        "nama": "Kabupaten Deiyai",
        "ibukota": "Tigi",
        "provinceCode": "94"
    }
],
  95: [
    {
        "kode": "95.01",
        "nama": "Kabupaten Jayawijaya",
        "ibukota": "Wamena",
        "provinceCode": "95"
    },
    {
        "kode": "95.02",
        "nama": "Kabupaten Pegunungan Bintang",
        "ibukota": "Oksibil",
        "provinceCode": "95"
    },
    {
        "kode": "95.03",
        "nama": "Kabupaten Yahukimo",
        "ibukota": "Sumohai",
        "provinceCode": "95"
    },
    {
        "kode": "95.04",
        "nama": "Kabupaten Tolikara",
        "ibukota": "Karubaga",
        "provinceCode": "95"
    },
    {
        "kode": "95.05",
        "nama": "Kabupaten Mamberamo Tengah",
        "ibukota": "Kobakma",
        "provinceCode": "95"
    },
    {
        "kode": "95.06",
        "nama": "Kabupaten Yalimo",
        "ibukota": "Elelim",
        "provinceCode": "95"
    },
    {
        "kode": "95.07",
        "nama": "Kabupaten Lanny Jaya",
        "ibukota": "Tiom",
        "provinceCode": "95"
    },
    {
        "kode": "95.08",
        "nama": "Kabupaten Nduga",
        "ibukota": "Kenyam",
        "provinceCode": "95"
    }
],
  96: [
    {
        "kode": "96.01",
        "nama": "Kabupaten Sorong",
        "ibukota": "Aimas",
        "provinceCode": "96"
    },
    {
        "kode": "96.02",
        "nama": "Kabupaten Sorong Selatan",
        "ibukota": "Teminabuan",
        "provinceCode": "96"
    },
    {
        "kode": "96.03",
        "nama": "Kabupaten Raja Ampat",
        "ibukota": "Waisai",
        "provinceCode": "96"
    },
    {
        "kode": "96.04",
        "nama": "Kabupaten Tambrauw",
        "ibukota": "Fef",
        "provinceCode": "96"
    },
    {
        "kode": "96.05",
        "nama": "Kabupaten Maybrat",
        "ibukota": "Kumurkek",
        "provinceCode": "96"
    },
    {
        "kode": "96.71",
        "nama": "Kota Sorong",
        "ibukota": "Sorong",
        "provinceCode": "96"
    }
],
};

export const ALL_INDONESIA_REGENCIES: WilayahRegency[] = Object.values(INDONESIA_REGENCIES_BY_PROVINCE).flat();

/**
 * Mendapatkan daftar semua provinsi di Indonesia (38 Provinsi)
 */
export function getProvinces(): WilayahProvince[] {
  return INDONESIA_PROVINCES;
}

/**
 * Mencari provinsi berdasarkan nama atau kode (case-insensitive & fuzzy)
 */
export function findProvince(query: string): WilayahProvince | undefined {
  if (!query) return undefined;
  const q = query.trim().toLowerCase();
  return INDONESIA_PROVINCES.find(
    (p) =>
      p.kode === q ||
      p.nama.toLowerCase() === q ||
      p.nama.toLowerCase().includes(q) ||
      q.includes(p.nama.toLowerCase())
  );
}

/**
 * Mendapatkan daftar kabupaten/kota berdasarkan kode atau nama provinsi
 */
export function getRegenciesByProvince(provinceQuery?: string | null): WilayahRegency[] {
  if (!provinceQuery) return ALL_INDONESIA_REGENCIES;
  const prov = findProvince(provinceQuery);
  if (!prov) return [];
  return INDONESIA_REGENCIES_BY_PROVINCE[prov.kode] || [];
}

/**
 * Mencari nama kabupaten/kota secara global di seluruh Indonesia
 */
export function searchRegencies(query: string, provinceQuery?: string | null): WilayahRegency[] {
  const pool = provinceQuery ? getRegenciesByProvince(provinceQuery) : ALL_INDONESIA_REGENCIES;
  if (!query || !query.trim()) return pool;
  const q = query.trim().toLowerCase();
  return pool.filter(
    (r) =>
      r.nama.toLowerCase().includes(q) ||
      r.ibukota.toLowerCase().includes(q) ||
      r.kode.toLowerCase().includes(q)
  );
}
