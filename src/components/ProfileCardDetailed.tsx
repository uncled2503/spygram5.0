import React from 'react';
import { ProfileData } from '../../types';
import { Zap, BadgeCheck, Shield, Lock } from 'lucide-react';

interface ProfileCardDetailedProps {
  profileData: ProfileData;
}

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('pt-BR').format(num);
};

const ProfileCardDetailed: React.FC<ProfileCardDetailedProps> = ({ profileData }) => {
  const bioLines = profileData.biography ? profileData.biography.split('\n').filter(line => line.trim() !== '') : [];
  const bioLine1 = bioLines[0] || '';
  const remainingBio = bioLines.slice(1).join('\n');

  return (
    <div className="relative bg-[#0f0f0f] border border-white/5 rounded-[2rem] p-8 shadow-2xl overflow-hidden group">
      
      <div className="flex flex-col items-center text-center">
        {/* Avatar com Brilho Roxo */}
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-purple-600/30 rounded-full blur-xl animate-pulse-slow" />
          <img
            src={profileData.profilePicUrl}
            alt={profileData.username}
            className="relative w-28 h-28 rounded-full object-cover border-4 border-[#1a1a1a]"
          />
        </div>

        {/* Nomes */}
        <div className="mb-8">
          <div className="flex items-center justify-center gap-2 mb-1">
            <h2 className="text-2xl font-black text-white tracking-tight">@{profileData.username}</h2>
            {profileData.isVerified && <BadgeCheck className="w-6 h-6 text-blue-400 fill-blue-400/10" />}
          </div>
          <p className="text-gray-400 font-bold text-sm">{profileData.fullName}</p>
        </div>

        {/* Stats Grid - Containers Escuros */}
        <div className="grid grid-cols-3 w-full gap-3 mb-8">
          <div className="bg-[#1a1a1a] rounded-2xl py-4 border border-white/5">
            <p className="text-xl font-black text-white">{formatNumber(profileData.postsCount)}</p>
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">Posts</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl py-4 border border-white/5">
            <p className="text-xl font-black text-white">{formatNumber(profileData.followers)}</p>
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">Seguidores</p>
          </div>
          <div className="bg-[#1a1a1a] rounded-2xl py-4 border border-white/5">
            <p className="text-xl font-black text-white">{formatNumber(profileData.following)}</p>
            <p className="text-[10px] uppercase font-black text-gray-500 tracking-widest mt-1">Seguindo</p>
          </div>
        </div>

        {/* Bio - Container Escuro com Raio Amarelo */}
        {(bioLine1 || remainingBio) && (
          <div className="w-full text-left bg-[#0a0a0a] rounded-2xl p-5 border border-white/5 mb-8">
            <div className="flex items-start gap-3">
              <Zap className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5 fill-yellow-400/20" />
              <div className="flex flex-col">
                <span className="text-sm text-gray-200 font-bold leading-tight">@{bioLine1}</span>
                {remainingBio && (
                  <p className="text-xs text-gray-500 font-medium mt-1 leading-relaxed">@{remainingBio}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Status Privado - Estilo "Pílula" Vermelha */}
        {profileData.isPrivate && (
          <div className="w-full flex items-center justify-center gap-3 py-3 rounded-full bg-red-950/20 border border-red-900/50">
            <Lock className="w-3.5 h-3.5 text-red-500" />
            <span className="text-[11px] font-black uppercase tracking-widest text-red-400">
              Criptografia de Conta Privada Quebrada
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileCardDetailed;