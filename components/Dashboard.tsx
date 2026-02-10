
import React from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { LogOut, User as UserIcon, ShieldCheck, LayoutDashboard } from 'lucide-react';
import { Board } from './Board';

export const Dashboard: React.FC = () => {
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 중 오류 발생:', error);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-8 pb-12">
      {/* 사용자 프로필 섹션 */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 h-32 relative">
          <div className="absolute -bottom-10 left-8">
            <div className="w-20 h-20 rounded-full bg-white border-4 border-white shadow-sm flex items-center justify-center text-blue-600">
              <UserIcon className="w-10 h-10" />
            </div>
          </div>
        </div>
        
        <div className="pt-14 pb-8 px-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center space-x-2">
                <span>{user?.displayName || '반가워요!'}</span>
                <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full font-medium">Active</span>
              </h2>
              <p className="text-gray-500 font-medium">{user?.email}</p>
            </div>
            <button
              onClick={handleSignOut}
              className="flex items-center space-x-2 px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-gray-600 transition-all font-medium"
            >
              <LogOut className="w-4 h-4" />
              <span>로그아웃</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-blue-50/50 rounded-xl border border-blue-100/50">
              <div className="flex items-center text-blue-600 mb-2 font-semibold">
                <ShieldCheck className="w-4 h-4 mr-2" />
                <span>계정 보안</span>
              </div>
              <p className="text-sm text-gray-600">Firebase 인증을 통해 안전하게 로그인되었습니다.</p>
            </div>
            
            <div className="p-4 bg-green-50/50 rounded-xl border border-green-100/50">
              <div className="flex items-center text-green-600 mb-2 font-semibold">
                <div className="w-2 h-2 rounded-full bg-green-500 mr-2"></div>
                <span>현재 상태</span>
              </div>
              <p className="text-sm text-gray-600">실시간 데이터 동기화가 활성화되어 있습니다.</p>
            </div>
          </div>
        </div>
      </div>

      <hr className="border-gray-100" />

      {/* 게시판 섹션 */}
      <div>
        <div className="flex items-center space-x-2 mb-6">
          <div className="w-8 h-8 bg-gray-900 rounded-lg flex items-center justify-center text-white">
            <LayoutDashboard className="w-4 h-4" />
          </div>
          <h2 className="text-xl font-bold text-gray-900">게시판 대시보드</h2>
        </div>
        <Board />
      </div>
    </div>
  );
};
