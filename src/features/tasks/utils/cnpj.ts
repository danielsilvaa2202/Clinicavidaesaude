// src/features/tasks/utils/cnpj.ts

// Formata string de 14 dígitos para "99.999.999/9999-99"
export function formatCnpj(cnpjDigits: string): string {
    const numeric = cnpjDigits.replace(/\D/g, '')
    if (numeric.length !== 14) {
      return cnpjDigits // se não for 14 dígitos, retorna inalterado
    }
    return numeric.replace(
      /^(\d{2})(\d{3})(\d{3})(\d{4})(\d{2})$/,
      '$1.$2.$3/$4-$5'
    )
  }
  
  // Remove qualquer não dígito (pontos, traços, barras)
  export function unmaskCnpj(cnpj: string): string {
    return cnpj.replace(/\D/g, '')
  }
  