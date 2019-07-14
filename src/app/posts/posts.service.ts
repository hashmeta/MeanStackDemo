import {Post} from './post.model'
import { Injectable } from '@angular/core';
import {Subject} from 'rxjs'
import {HttpClient} from '@angular/common/http'
import {map} from 'rxjs/operators'
import { Router } from '@angular/router';
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
    onAddPost(title:string,content:string){
        const post:Post={id:null,title:title,content:content}
        this.http.post<{message:string,postId:String}>('http://localhost:3000/api/posts',post)
        .subscribe((responseData)=>{
            const id=responseData.postId
            post.id=id
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