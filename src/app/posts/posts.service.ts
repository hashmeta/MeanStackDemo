import {Post} from './post.model'
import { Injectable } from '@angular/core';
import {Subject} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {map, concat} from 'rxjs/operators'
import { Router } from '@angular/router';
import {dataURItoBlob} from './dataURItoBlob'
const MIME_TYPE_MAP={
    'image/png':'png',
    'image/jpeg':'jpeg',
    'image/jpg':'jpg'
}
let ext:any

@Injectable({providedIn:'root'})
export class PostService{
    private posts:Post[]=[]
    private postsUpdated = new Subject<Post[]>();
    constructor(private http:HttpClient,private router:Router){}
    getPosts(){
        this.http
        .get<{message:string,posts:any}>('http://localhost:3000/api/posts')
        .pipe(map((postData)=>{
            return postData.posts.map(post => {
                return {
                    title:post.title,
                    content:post.content,
                    id:post._id
                }
            })
        }))
        .subscribe((pipedpostData)=>{
            this.posts=pipedpostData
            this.postsUpdated.next([...this.posts])
        })
    }
    getPostUpdateListener(){
        return this.postsUpdated.asObservable()
    }
    updatePost(id:string,title:string,content:string){
        const post:Post={id:id,title:title,content:content}
        this.http.put('http://localhost:3000/api/posts/'+id,post)
            .subscribe(response=>{
                const updatedPosts=[...this.posts]
                const  oldPostIndex=updatedPosts.findIndex(p=>p.id===id)
                updatedPosts[oldPostIndex]=post
                this.posts=updatedPosts
                this.postsUpdated.next([...this.posts])
                this.router.navigate(["/"])
            })
    }
    getPost(id:string){
        return this.http.get<{_id:string,title:string,content:string}>('http://localhost:3000/api/posts/'+id)
    }
    onAddPost(title:string,content:string,imagesObject:Array<string>){
        const postData=new FormData()
        postData.append("title",title)
        postData.append("content",content)
        for (var i = 0; i < imagesObject.length; i++) {
            let data:any=dataURItoBlob(imagesObject[i])
            ext=MIME_TYPE_MAP[data.type]
            console.log(ext)
            postData.append("images",new File([data],Date.now()+String(i)+'.'+ext,{type:data.type}))
        }
        postData.forEach((value, key) => {
            console.log(key, value);
        })
        this.http.post<{message:string,postId:String}>('http://localhost:3000/api/posts',postData)
        .subscribe((responseData)=>{
            const post:Post={
                id:responseData.postId,
                title:title,
                content:content
            }
            this.posts.push(post)
            this.postsUpdated.next([...this.posts])
            this.router.navigate(["/"])
        })
        
    }
    onDeletePost(postId : String){
        this.http.delete("http://localhost:3000/api/posts/"+ postId)
            .subscribe(()=>{
                console.log('Deleted')
                const updatedPosts= this.posts.filter(post=>post.id !==postId)
                this.posts=updatedPosts
                this.postsUpdated.next([...this.posts])
            })
    }
}