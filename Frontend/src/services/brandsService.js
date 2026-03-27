// import http from './httpClient';  // ✅ Reuse your existing httpClient

// // Brand Comparison API
// export async function getBrandComparison(range = '30d') {
//   const response = await http.get('/api/brands/compare', {
//     params: {
//       range: range  // 7d, 30d, 90d
//     }
//   });
  
//   return response.data;  // Returns array of brands with sentiment, trend, etc.
// }
