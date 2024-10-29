import { atom, useAtom } from "jotai"
import { Comment, NewComment } from "../../../entities/comment/model/types"
import { addCommentApi, deleteCommentApi, fetchCommentsApi, updateCommentApi } from "../../../entities/comment/api"
import { likeCommentApi } from "../api"

const commentsAtom = atom<Record<Comment["postId"], Comment[]>>({})

export const useComments = () => {
  const [comments, setComments] = useAtom(commentsAtom)

  const getComments = async (postId: number) => {
    if (comments[postId]) return // 이미 불러온 댓글이 있으면 다시 불러오지 않음
    const data = await fetchCommentsApi(postId)
    setComments((prev) => ({ ...prev, [postId]: data.comments }))
  }

  const addComment = async (newComment: NewComment) => {
    const data = await addCommentApi(newComment)

    setComments((prev) => ({
      ...prev,
      [data.postId]: [...(prev[data.postId] || []), data],
    }))
  }

  const likeComment = async (id: number, postId: number) => {
    const likes = comments[postId].find((c) => c.id === id).likes + 1

    const data = await likeCommentApi(id, likes)

    setComments((prev) => ({
      ...prev,
      [postId]: prev[postId].map((comment) => (comment.id === data.id ? { ...data, likes } : comment)),
    }))
  }

  const deleteComment = (id: number, postId: number) => {
    deleteCommentApi(id)

    setComments((prev) => ({
      ...prev,
      [postId]: prev[postId].filter((comment) => comment.id !== id),
    }))
  }

  const updateComment = async (selectedComment: Comment) => {
    const data = await updateCommentApi(selectedComment)

    setComments((prev) => ({
      ...prev,
      [data.postId]: prev[data.postId]?.map((comment) => (comment.id === data.id ? data : comment)),
    }))
  }

  return {
    comments,
    getComments,
    addComment,
    deleteComment,
    updateComment,
    likeComment,
  }
}
