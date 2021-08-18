const params = [...new URLSearchParams(location.search).keys()]

export const library = params.includes('zmk') ? 'zmk' : 'qmk'