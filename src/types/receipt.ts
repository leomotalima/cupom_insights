export type Receipt = {
  id: string;                        
  estabelecimento: string;           
  valorTotal: number;                
  data: string;                      
  categoria: 'Alimentação' | 'Transporte' | 'Lazer' | 'Mercado' | 'Outros'; 
  imagemUrl?: string;                
  criadoEm: Date;                    
};
