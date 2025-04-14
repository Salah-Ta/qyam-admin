
// import { createAuthMiddleware } from "better-auth/plugins";
// import { BetterAuthPlugin } from "better-auth/types";



// export const programStatusPlugin = {
//     id: "status-plugin",
//     middlewares: [
//         {
//             path: "/api/auth/sign-in",
//             middleware: createAuthMiddleware(async(ctx:any)=>{
//                 console.log("in status-plugin middleware [createAuthMiddleware]: ", ctx);
//                 throw new Error("api error for the mdidleware")

                
//                 //do something
//             })
//         }
//     ]
// } satisfies BetterAuthPlugin


// export const hookPlugin = {
//     id: "hook-plugin",
//     hooks: {
//         before: [{
//                 matcher: (context:any)=>{    
//                     return context.context.endpoint.path.includes("sign-in")
//                 },
//                 handler: createAuthMiddleware(async(ctx:any)=>{
//                    const user = await ctx.context.adapter.findOne({model:"user", where:[{value:ctx.body.email,field:"email"}]}) as QUser

//                    if( user.acceptenceState==="accepted")    return  {
//                     context: ctx // if you want to modify the context
//                 } 
            

//                 // throw new APIError("UNAUTHORIZED", {
//                 //     message: "Id is not allowed"
//                 // })
//                 return Response.error()

            
        
            
             
//                 })
//             }],
//         after: [
//             // {
//             //     matcher: (context:any)=>{    
//             //         return context.context.endpoint.path.includes("sign-in")
//             //     },
//             //     handler: createAuthMiddleware(async(ctx)=>{
//             //         console.log("createAuthMiddleware:  ", ctx);
//             //     //    if( user.acceptenceState==="accepted")    return  {
//             //     //     context: ctx // if you want to modify the context
//             //     // } 

//             //     // else     
//             //         // throw new Error("hiii")


//             //         return ctx.json({
//             //             message: "Hello World"
//             //         }) // if you want to modify the response
             
//             //     })
//             // }
//            ],

        
//     }

// } satisfies BetterAuthPlugin

  
