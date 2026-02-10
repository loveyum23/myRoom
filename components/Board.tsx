
import React, { useState, useEffect, useRef } from 'react';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { 
  ref as sRef, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, auth, storage } from '../firebaseConfig';
import { Post } from '../types';
import { 
  PenSquare, 
  Trash2, 
  MessageSquare, 
  Calendar, 
  User, 
  ChevronRight,
  Send,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Type,
  Image as ImageIcon,
  Loader2
} from 'lucide-react';

export const Board: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Firestore 실시간 목록 조회
  useEffect(() => {
    const q = query(collection(db, 'posts'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const postData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Post[];
      setPosts(postData);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // 서식 적용 함수
  const applyStyle = (command: string, value: string = '') => {
    document.execCommand(command, false, value);
    updateContentFromEditor();
  };

  const updateContentFromEditor = () => {
    if (editorRef.current) {
      setContent(editorRef.current.innerHTML);
    }
  };

  const handleEditorInput = () => {
    updateContentFromEditor();
  };

  // 사진 업로드 핸들러
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // 파일 타입 검증
    if (!file.type.startsWith('image/')) {
      alert("이미지 파일만 업로드 가능합니다.");
      return;
    }

    setIsUploading(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("로그인 필요");

      // Storage 경로 설정: posts/유저ID/타임스탬프_파일명
      const storagePath = `posts/${currentUser.uid}/${Date.now()}_${file.name}`;
      const imageRef = sRef(storage);
      
      // 실제 업로드 로직 (경로 포함 객체 생성 방식)
      const fileRef = sRef(storage, storagePath);
      const uploadResult = await uploadBytes(fileRef, file);
      const downloadURL = await getDownloadURL(uploadResult.ref);

      // 에디터에 이미지 삽입
      editorRef.current?.focus();
      applyStyle('insertImage', downloadURL);
      
      // 삽입된 이미지에 스타일을 주기 위한 커스텀 처리 (선택사항)
      // execCommand로 삽입된 이미지는 스타일 조절이 어려우므로 
      // 렌더링 시 prose 클래스로 자동 조절되게 함.
    } catch (error) {
      console.error("이미지 업로드 중 오류:", error);
      alert("이미지 업로드에 실패했습니다.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // 게시글 저장
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim() || content === '<br>') {
      alert("제목과 내용을 입력해주세요.");
      return;
    }

    setIsSubmitting(true);
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) throw new Error("로그인 필요");

      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content,
        authorId: currentUser.uid,
        authorName: currentUser.displayName || currentUser.email?.split('@')[0] || '익명 사용자',
        createdAt: Date.now()
      });

      setTitle('');
      setContent('');
      if (editorRef.current) editorRef.current.innerHTML = '';
    } catch (error) {
      console.error(error);
      alert("게시글 저장 실패");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (postId: string, authorId: string) => {
    if (auth.currentUser?.uid !== authorId) return;
    if (window.confirm("삭제하시겠습니까?")) {
      await deleteDoc(doc(db, 'posts', postId));
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-10">
      {/* 리치 텍스트 에디터 섹션 */}
      <section className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <PenSquare className="w-5 h-5 text-blue-600" />
            <h3 className="font-bold text-gray-800">에디터로 글쓰기</h3>
          </div>
        </div>
        
        <div className="p-6 space-y-4">
          <input
            type="text"
            placeholder="제목을 입력하세요"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full text-xl font-bold px-0 py-2 border-b border-transparent focus:border-blue-500 outline-none transition-all placeholder:text-gray-300 text-gray-900"
          />

          {/* 툴바 */}
          <div className="flex flex-wrap items-center gap-1 p-2 bg-gray-50 rounded-lg border border-gray-100">
            <ToolbarButton onClick={() => applyStyle('bold')} icon={<Bold className="w-4 h-4" />} title="굵게" />
            <ToolbarButton onClick={() => applyStyle('italic')} icon={<Italic className="w-4 h-4" />} title="기울임" />
            <ToolbarButton onClick={() => applyStyle('underline')} icon={<Underline className="w-4 h-4" />} title="밑줄" />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton 
              onClick={() => fileInputRef.current?.click()} 
              icon={isUploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ImageIcon className="w-4 h-4" />} 
              title="사진 추가" 
              disabled={isUploading}
            />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => applyStyle('insertUnorderedList')} icon={<List className="w-4 h-4" />} title="불렛 리스트" />
            <ToolbarButton onClick={() => applyStyle('insertOrderedList')} icon={<ListOrdered className="w-4 h-4" />} title="숫자 리스트" />
            <div className="w-px h-6 bg-gray-200 mx-1" />
            <ToolbarButton onClick={() => applyStyle('justifyLeft')} icon={<AlignLeft className="w-4 h-4" />} title="왼쪽 정렬" />
            <ToolbarButton onClick={() => applyStyle('justifyCenter')} icon={<AlignCenter className="w-4 h-4" />} title="가운데 정렬" />
            <ToolbarButton onClick={() => applyStyle('justifyRight')} icon={<AlignRight className="w-4 h-4" />} title="오른쪽 정렬" />
            
            {/* 숨겨진 파일 인풋 */}
            <input 
              type="file" 
              ref={fileInputRef} 
              onChange={handleImageUpload} 
              className="hidden" 
              accept="image/*" 
            />
          </div>

          {/* 에디터 본문 */}
          <div
            ref={editorRef}
            contentEditable
            onInput={handleEditorInput}
            className="w-full min-h-[300px] py-4 outline-none text-gray-700 leading-relaxed prose prose-blue max-w-none scroll-smooth"
            data-placeholder="내용을 입력하고 툴바를 이용해 서식이나 사진을 추가해보세요..."
          ></div>
          <style>{`
            [contentEditable]:empty:before {
              content: attr(data-placeholder);
              color: #d1d5db;
              cursor: text;
            }
            [contentEditable] img {
              max-width: 100%;
              height: auto;
              border-radius: 0.75rem;
              margin: 1.5rem 0;
            }
          `}</style>

          <div className="flex justify-between items-center pt-4 border-t border-gray-50">
            <div className="flex items-center text-xs text-gray-400">
              <Type className="w-3 h-3 mr-1" />
              <span>HTML 서식과 사진이 안전하게 저장됩니다.</span>
            </div>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || isUploading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold transition-all flex items-center space-x-2 disabled:bg-blue-300 shadow-lg shadow-blue-100"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>게시하기</span>
                  <Send className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* 게시글 목록 */}
      <section className="space-y-6">
        <div className="flex items-center space-x-2 border-b border-gray-200 pb-4">
          <MessageSquare className="w-5 h-5 text-gray-700" />
          <h3 className="font-bold text-xl text-gray-900">최근 게시글</h3>
        </div>

        {!isLoaded ? (
          <div className="text-center py-10 text-gray-400">불러오는 중...</div>
        ) : posts.length === 0 ? (
          <div className="text-center py-20 bg-gray-50 rounded-3xl text-gray-400">게시글이 없습니다.</div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {posts.map((post) => (
              <article key={post.id} className="bg-white p-7 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-100 transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <h4 className="text-xl font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
                    {post.title}
                  </h4>
                  {auth.currentUser?.uid === post.authorId && (
                    <button onClick={() => handleDelete(post.id, post.authorId)} className="text-gray-300 hover:text-red-500 p-2 transition-all">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                </div>
                
                {/* 리치 텍스트 렌더링 (이미지 포함) */}
                <div 
                  className="text-gray-600 prose prose-sm prose-blue max-w-none mb-6 overflow-hidden"
                  dangerouslySetInnerHTML={{ __html: post.content }}
                />
                
                <div className="mt-4 flex items-center justify-between text-sm text-gray-400 border-t border-gray-50 pt-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                        <User className="w-3 h-3 text-blue-500" />
                      </div>
                      <span className="font-medium text-gray-600">{post.authorName}</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(post.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-blue-500 transition-colors" />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

const ToolbarButton: React.FC<{ 
  onClick: () => void; 
  icon: React.ReactNode; 
  title: string;
  disabled?: boolean;
}> = ({ onClick, icon, title, disabled }) => (
  <button
    type="button"
    disabled={disabled}
    onClick={(e) => {
      e.preventDefault();
      onClick();
    }}
    className="p-2 hover:bg-white hover:shadow-sm rounded-md text-gray-500 hover:text-blue-600 transition-all disabled:opacity-50"
    title={title}
  >
    {icon}
  </button>
);
