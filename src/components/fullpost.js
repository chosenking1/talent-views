
import '../css/fullpost.modules.css'
import { useState, useEffect, useContext, useRef } from 'react'
import axios from 'axios'
import { ChatBubble, Favorite, ArrowUpwardOutlined, FavoriteBorder, Home, Share, LocationOn } from '@material-ui/icons'
import ArrowCircleUpIcon from '@mui/icons-material/ArrowCircleUp';
import DeleteForeverRoundedIcon from '@mui/icons-material/DeleteForeverRounded';
import RemoveCircleRoundedIcon from '@mui/icons-material/RemoveCircleRounded';
import {useParams,Link, useNavigate} from 'react-router-dom'
import {format} from 'timeago.js'
import Navbar from './navbar';
import ReactPlayer from 'react-player'
import { AuthContext } from '../authContext/authContext';
import image from '../images/stockphoto.jpeg'
import PostControl from '../components/postControl'


const formated = (seconds) => {
    if (isNaN(seconds)){
        return '00:00'
    }
    const date = new Date(seconds * 1000)
    const hh = date.getUTCHours()
    const mm = date.getUTCMinutes()
    const ss = date.getUTCSeconds().toString().padStart(2, '0')
    if (hh){
        return `${hh}:${mm.toString().padStart(2, '0')}:${ss}`
    }

    return `${mm}:${ss}`
}

let count = 0

const Fullpost = ({user, post}) => {

    // console.log(post)


    const history = useNavigate()
    const [click, setClick] = useState(false)
    const [show, setShow] = useState(false)
    // const [post, setPost] = useState([])
    const [isHovered, setIsHovered] = useState(false)
    const [isLiked, setIsLiked] = useState(false)
    const [timeDisplayFormat, setTimeDisplayFormat] = useState('normal')
    const [isUpvoted, setIsUpvoted] = useState(false)
    const [profilePicture, setProfilePicture] = useState('')
    const { user:currentUser, dispatch } = useContext(AuthContext)
    const [followUser, setFollowUser] = useState(currentUser.following?.includes(post._creator?._id))
    const [like, setLike] = useState(post.likes?.length)
    const [upvote, setUpvote] = useState(post.upvotes?.length)
    const [vid, setVid] = useState([])
    const {id} = useParams()
    const [state, setState] = useState({
        playing: true,
        muted: true,
        volume: 1,
        playbackRate: 1.0,
        played: 0,
        seeking: false,
    })

    const {playing, muted, volume, playbackRate, played, seeking} = state
    const playerRef = useRef(null)
    const playerContainerRef = useRef(null)
    const controlsRef = useRef(null)

    const handlePlayPause = () => {
        setState({...state, playing: !state.playing})
    }

    const handleRewind = () => {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() - 10)
    }

    const handleFastForward = () => {
        playerRef.current.seekTo(playerRef.current.getCurrentTime() + 10)
    }

    const handleMute = () => {
        setState({...state, muted: !state.muted})
    }

    const handleVolumeChange = (e, newValue) => {
        setState({
            ...state, 
            volume: parseFloat(newValue/100), 
            muted: newValue === 0 ? true:false
        })
    }

    const handleChangeDisplayFormat = () => {
        setTimeDisplayFormat(
         timeDisplayFormat==='normal'
        ?'remaining' : 'normal',)
    }

    const handleVolumeSeekUp = (e, newValue) => {
        setState({
            ...state, 
            volume: parseFloat(newValue/100), 
            muted: newValue === 0 ? true:false
        })
    }

    const handlePlaybackRateChange = (rate) => {
        setState({...state, playbackRate: rate})
    }
    

    const currentTime = playerRef.current 
    ? playerRef.current.getCurrentTime() 
    : '00:00';
    const duration = playerRef.current 
    ? playerRef.current.getDuration() 
    : '00:00'; 

    const elapsedTime = timeDisplayFormat==='normal' 
    ? formated(currentTime) 
    : `-${formated(duration - currentTime)}`;
    const totalDuration = formated(duration)

    useEffect(() => {
        setIsLiked(post.likes?.includes(currentUser._id))
    }, [currentUser._id, post.likes])

    useEffect(() => {
        setIsLiked(post.upvotes?.includes(currentUser._id))
    }, [currentUser._id, post.upvotes])

    useEffect(() => {
        const followUser = async () => {
           const { data } = await axios.put(`/users/${post._creator?._id}/follow`)
           setFollowUser(user.following.includes(user?._id))
        }
        followUser()
    }, [post._creator?._id, user, user?._id])

const newArr = []
// console.log(newArr, 'new Array------')

console.log(post?.video)

    useEffect(() => {
        const getUser = async () => {
           const { data } = await axios.get(`/users/find/${post._creator?._id}`)
           setProfilePicture(data.profilePicture[0]?.profilePicture)
        //    setVid(data._posts[0]?.video[0].video) 
        
          data._posts.map((post) => (newArr.push(post.video[0].video)))
        //   console.log(newArr, 'deji------')
        //    setVid(...newArr)
        //    console.log('array', newArr)
        //    console.log('video', vid)
        }
        getUser()
    }, [post._creator])


    // useEffect(()=> {
    //     const getVideo = async () => {
    //         const { data } = await axios.get(`/posts/find/${id}`)
    //         setProfilePicture(data.getOnePost?._creator.profilePicture[0].profilePicture)
    //         setVid(data.getOnePost?.video[0].video)
    //     }
    //     getVideo()
    // }, [id])

    const handleFollow = async () => {
        try { 
            if (followUser) {
                await axios.put(`/users/${post._creator?._id}/unfollow`,{
                    userId: currentUser._id,
                })
                dispatch({type: 'UNFOLLOW', payload: post._creator?._id})
            } else {
                await axios.put(`/users/${post._creator?._id}/follow`,{
                    userId: currentUser._id,
                })
                dispatch({type: 'FOLLOW', payload: post._creator?._id})
            }
        } catch (err) {
            console.log(err)
        }
        setFollowUser(!followUser)
    }
            

    const handleLike = async () => {
            try {
                await axios.put(`/posts/${post._id}/like`, {
                    userId: currentUser._id,
                })
                if(!isLiked && post.likes.includes(currentUser._id)){
                    setClick(true)
                    setLike(like + 1)
                }
                if(isLiked && post.likes.includes(currentUser._id)){
                    setClick(false) 
                    setLike(like - 1)
                } 
                window.location.reload()
                setClick(true)
                setIsLiked(!isLiked)
                
            } catch (err) {
                console.log(err)
            }
        
    }


    const handleUpvote = async () => {
        try {
            await axios.put(`/posts/${post._id}/upvote`, {
                userId: currentUser._id,
            })
            if(!isUpvoted){
                setUpvote(upvote + 1)
            }
            if(isUpvoted){
                setUpvote(upvote - 1)
            } 
            window.location.reload()
            setIsUpvoted(!isUpvoted)          
        } catch (err) {
            console.log(err)
        }
    
}

const handleIcon = async() => {
    try {
        await axios.delete(`/posts/${post._id}`)
        history(`/profile/${currentUser._id}`)
        window.location.reload()
        
    } catch (err) {
        console.log(err)
    }
}



return(
    <>
   
        <div className="fullpost-container" 
        style={{width: '100vw'}}
        >
            <div className="fullpost">
                <div className="fullpost-img-container"
                onMouseEnter={()=>setShow(true)}
                onMouseLeave={()=>setShow(false)}
                >
                    {/* <video id=""className="fullpost-img" src={vid} alt="new stuff" type="mp4" controls/> */}
                    <ReactPlayer
                    ref={playerRef}
                    url={newArr} 
                    playing={playing} 
                    muted={muted}
                    volume={volume}
                    playbackRate={playbackRate}
                    // onProgress={handleProgress}
                    width='100%'
                    height='100%'
                    />

            {show && (
                <PostControl
                // film={film}
                // ref={controlsRef}
                onPlayPause={handlePlayPause}
                playing={playing}
                onRewind={handleRewind}
                onFastForward={handleFastForward}
                muted={muted}
                onMute={handleMute}
                onvolumechange={handleVolumeChange}
                onVolumeSeekUp={handleVolumeSeekUp}
                volume={volume}
                playbackRate={playbackRate}
                onPlaybackRateChange={handlePlaybackRateChange}
                played={played}
                // onSeek={handleSeekChange}
                // onSeekMouseDown={handleSeekMouseDown}
                // onSeekMouseUp={handleSeekMouseUp}
                elapsedTime={elapsedTime}
                totalDuration={totalDuration}
                onChangeDisplayFormat={handleChangeDisplayFormat}
                />
            )}

                </div>
                <div className="fullpost-engagement-container">
                    <div className="fullpost-top">
                        <div className="person-info">
                            <div className="person-info-left">
                                <Link to={`/profile/${post._creator?._id}`} >
                                    <img className="person-info-img" src={profilePicture || image} alt="" />
                                </Link>
                                <span className="person-info-name">
                                    {post._creator?.username}
                                </span>
                               
                            </div>
                            <div className="person-info-right">
                                {post._creator?.email === currentUser.email && (
                                    <>
                                    {
                                        isHovered ? (
                                            <RemoveCircleRoundedIcon 
                                            onMouseEnter={()=>setIsHovered(true)}
                                            onMouseLeave={()=>setIsHovered(false)}    
                                            onClick={handleIcon}
                                            style={{
                                            color: 'red', 
                                            fontSize: '30px', 
                                            marginRight: '30px',
                                            cursor: 'pointer'
                                        }}
                                            />
                                        ) : (
                                            <DeleteForeverRoundedIcon 
                                            onMouseEnter={()=>setIsHovered(true)}
                                            onMouseLeave={()=>setIsHovered(false)}    
                                            onClick={handleIcon}
                                            style={{
                                            color: 'white', 
                                            fontSize: '30px', 
                                            marginRight: '30px',
                                            cursor: 'pointer'
                                        }}
                                            />
                                        )
                                    }
                                    </>
                                )}
                                {post._creator?.email !== currentUser.email && (
                                <button className="post-info-button"
                                onClick={handleFollow}
                                >
                                    {followUser ? 'Unfollow' : 'Follow'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="fullpost-bottom">
                        <div className="fullpost-caption-container">
                            <span className="fullpost-caption">
                                {post.description}
                            </span>
                            <span className="fullpost-time">
                                {format(post.createdAt)}
                            </span>
                        </div>
                        <div className="fullpost-engagement">
                            <div className="fullpost-social">
                                {
                            !click ? (
                                <FavoriteBorder style={{fontSize:"50px", margin: "0 10px"}} onClick={handleLike}/>
                            ) : (
                                <Favorite style={{fontSize:"50px", margin: "0 10px", color: 'red'}} onClick={handleLike}/>
                            )
                            }
                                <span className="likes">
                                    {post.likes?.length}
                                </span>
                            </div>
                            <div className="fullpost-social">
                                <ArrowCircleUpIcon style={{fontSize:"50px", margin: "0 10px"}} onClick={handleUpvote}/>
                                <span className="upvotes">
                                {post.upvotes?.length}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>  
    </>
    )
}

export default Fullpost