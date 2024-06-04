const express=require('express');
const axios=require('axios');
const app=express();
const PORT=9876;
const WIN_SIZE=10;
const TEST_URL='http://20.244.56.144/test';
const state={
    nums:[],
    prevState:[],
    currState:[]
};
const isP=(num)=>{
    if(num<=1) return false;
    if(num<=3) return true;
    if(num%2===0||num%3===0) return false;
    for(let i=5;i*i<=num;i+=6){
        if(num%i===0||num%(i+2)===0) return false;
    }
    return true;
};
const genP=(n)=>{
    const primes=[];
    let num=2;
    while(primes.length<n){
        if(isP(num)){
            primes.push(num);
        }
        num++;
    }
    return primes;
};
const fibo=(n)=>{
    let nums=[0,1];
    for(let a=2;a<n;a++){
        nums.push(nums[a-1]+nums[a-2]);
    }
    return nums.slice(0,n);
};
const even=(n)=>{
    let nos=[];
    for(let a=0;a<n;a++){
        nos.push(a*2);
    }
    return nos;
};
const rand=(n)=>{
    let randNums=[];
    for(let a=0;a<n;a++){
        randNums.push(Math.floor(Math.random()*100));
    }
    return randNums;
};
const getNumsFromServer=async(type)=>{
    const endpoints={
        'p':`${TEST_URL}/primes`,
        'f':`${TEST_URL}/fibo`,
        'e':`${TEST_URL}/even`,
        'r':`${TEST_URL}/rand`
    };
    if(!endpoints[type]){
        throw new Error('Invalid type');
    }
    const response=await axios.get(endpoints[type]);
    return response.data.numbers||[];
};
app.post('/test/primes',async(req,res)=>{
    try{
        const data=req.body;
        const response=await axios.post(`${TEST_URL}/primes`,data);
        res.json(response.data);
    }catch(error){
        res.status(500).json({error:error.message});
    }
});
const calcAvg=(nums)=>{
    const sum=nums.reduce((acc,num)=>acc+num,0);
    return nums.length?(sum/nums.length).toFixed(2):0;
};
app.get('/numbers/:type',async(req,res)=>{
    const type=req.params.type;
    try{
        const newNums=await getNumsFromServer(type);
        const uniqueNums=[...new Set(newNums)];
        state.prevState=[...state.currState];
        state.currState=[
            ...state.currState,
            ...uniqueNums
        ].slice(-WIN_SIZE);
        const avg=calcAvg(state.currState);
        res.json({
            numbers:newNums,
            prevState:state.prevState,
            currState:state.currState,
            avg
        });
    }catch(error){
        res.status(500).json({error:error.message});
    }
});
app.get('/generate/primes/:n',(req,res)=>{
    const n=parseInt(req.params.n,10);
    res.json({numbers:genP(n)});
});
app.get('/generate/fibo/:n',(req,res)=>{
    const n=parseInt(req.params.n,10);
    res.json({numbers:fibo(n)});
});
app.get('/generate/even/:n',(req,res)=>{
    const n=parseInt(req.params.n,10);
    res.json({numbers:even(n)});
});
app.get('/generate/rand/:n',(req,res)=>{
    const n=parseInt(req.params.n,10);
    res.json({numbers:rand(n)});
});
app.listen(PORT,()=>{
    console.log(`Server running on http://localhost:${PORT}`);
});
