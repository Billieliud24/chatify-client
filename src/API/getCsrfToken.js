
export const getCsrfToken = async ()=>{
    try{
        const url = 'https://chatify-api.up.railway.app/csrf';

        const response = await fetch(url,{
            method:"PATCH",
            credentials:'include',
        });
        if(!response.ok){
            throw new Error(`servern svarade med felstatus:{(response.status}`)
        }
        const data = await response.json();
        if(!data.csrfToken){
            throw new Error('svaret från server saknade det förväntade csrftoken')
        }
        return data.csrfToken;
        
    }catch (error){

        console.error("CSRF-token kunde inte hämtas",error)
        throw error;
        
    }
};