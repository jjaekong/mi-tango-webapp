const list = [
    { code: 'KR', name: '한국', english: 'South Korea' },
    { code: 'CN', name: '中国', english: 'China' },
    { code: 'AR', name: 'Argentina', english: 'Argentina' },
]

export function getCountries() {
    return list
}

export function existCountry(code) {
    return list.findIndex(country => country.code === code) > -1 ? true : false;
}

export function getCountryName(code) {
    return list.find(country => country.code === code).name
}