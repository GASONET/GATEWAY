import axios from 'axios'

export const callTokenSesion = async (data: any, auth: string): Promise<any> => {
  data = {
    'token': {
      'canal': 3,
      'numeroAuditoria': '34562we',
      'origen': 'pruebas.tx',
      'usuario': 'pruebas.comercio.tx',
      'idOrganizacion': 10000443
    }
  }

  // handling para retornar solo el token
  return await axios.post(String(process.env.TOKEN_URL),
    data, {
    headers:
      { Authorization: auth }
  })
}

export const callTokenSesionReg = async (data: any, auth: string): Promise<any> => {
  data = {
      'token' : {
      'canal' : 3, 
      'numeroAuditoria' : '34562we',
      'origen' : 'gasonet', 
      'usuario' : 'gasonet.pruebas', 
      'idOrganizacion' : 14	
    }	
  }

  // handling para retornar solo el token
  return await axios.post(String(process.env.TOKEN_URL),
    data, {
    headers:
      { Authorization: auth }
  })
}

export const callRestServer = (url: string, data: any, auth: string) => {    
  return new Promise( (resolve:any, reject:any) => {
    axios.post(url,
    data, {
    headers:
      { Authorization: auth }
    }).then( (response: any) => {
      if(response.data) resolve(response.data)
      else resolve(false)
    })
    .catch( (error:any) => {
      reject(error)
    })
  })
}