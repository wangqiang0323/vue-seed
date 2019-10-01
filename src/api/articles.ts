import Axios from '@/axios-config'

export const GetUser = () => {
  return Axios.get('/user')
}

export const GetArticles = () => {
  return Axios.get('/articles')
}

