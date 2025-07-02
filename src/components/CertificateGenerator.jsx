import React from 'react';
import { motion } from 'framer-motion';
import { Download, Award, Calendar, User, Trophy, Star, Users } from 'lucide-react';

const CertificateGenerator = ({ playerData, onDownload }) => {
  const generateCertificate = () => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size for high quality
    canvas.width = 1200;
    canvas.height = 900;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
    gradient.addColorStop(0, '#1e293b');
    gradient.addColorStop(0.5, '#3b4d6b');
    gradient.addColorStop(1, '#1e293b');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Decorative border
    ctx.strokeStyle = '#3b82f6';
    ctx.lineWidth = 8;
    ctx.strokeRect(40, 40, canvas.width - 80, canvas.height - 80);
    
    // Inner decorative border
    ctx.strokeStyle = '#8b5cf6';
    ctx.lineWidth = 4;
    ctx.strokeRect(60, 60, canvas.width - 120, canvas.height - 120);
    
    // Title
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 64px serif';
    ctx.textAlign = 'center';
    ctx.fillText('CERTIFICATE OF ACHIEVEMENT', canvas.width / 2, 180);
    
    // Subtitle
    ctx.fillStyle = '#3b82f6';
    ctx.font = '32px serif';
    ctx.fillText('Digital Escape Room Master', canvas.width / 2, 240);
    
    // Award text
    ctx.fillStyle = '#ffffff';
    ctx.font = '28px serif';
    ctx.fillText('This certifies that', canvas.width / 2, 320);
    
    // Team name
    ctx.fillStyle = '#fbbf24';
    ctx.font = 'bold 48px serif';
    ctx.fillText(playerData.teamName || 'Escape Room Champions', canvas.width / 2, 390);
    
    // Achievement text
    ctx.fillStyle = '#ffffff';
    ctx.font = '24px serif';
    ctx.fillText('has successfully completed', canvas.width / 2, 450);
    
    // Theme name
    ctx.fillStyle = '#10b981';
    ctx.font = 'bold 36px serif';
    ctx.fillText(getThemeName(playerData.theme), canvas.width / 2, 510);
    
    // Performance stats
    ctx.fillStyle = '#e5e7eb';
    ctx.font = '20px sans-serif';
    ctx.textAlign = 'left';
    const statsY = 580;
    const leftColumn = canvas.width / 2 - 200;
    const rightColumn = canvas.width / 2 + 50;
    
    ctx.fillText(`🎯 Stages Completed: ${playerData.stagesCompleted}/6`, leftColumn, statsY);
    ctx.fillText(`⏱️ Time Taken: ${playerData.timeTaken}`, rightColumn, statsY);
    ctx.fillText(`💡 Hints Used: ${playerData.hintsUsed}`, leftColumn, statsY + 30);
    ctx.fillText(`⭐ Difficulty: ${capitalize(playerData.difficulty)}`, rightColumn, statsY + 30);
    ctx.fillText(`🏆 Performance: ${getPerformanceRating(playerData)}`, leftColumn, statsY + 60);
    ctx.fillText(`📅 Completed: ${formatCompletionDate(playerData.completionDate)}`, rightColumn, statsY + 60);
    
    // Team badge
    ctx.fillStyle = '#3b82f6';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('🏅 Team Achievement Award', canvas.width / 2, statsY + 100);
    
    // Footer
    ctx.fillStyle = '#6b7280';
    ctx.font = '18px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('Allfun.us Digital Escape Room Experience', canvas.width / 2, 750);
    ctx.fillText('Powered by Advanced Puzzle Technology', canvas.width / 2, 780);
    
    // Decorative elements
    drawStar(ctx, 200, 200, 30, '#fbbf24');
    drawStar(ctx, canvas.width - 200, 200, 30, '#fbbf24');
    drawStar(ctx, 150, canvas.height - 150, 25, '#3b82f6');
    drawStar(ctx, canvas.width - 150, canvas.height - 150, 25, '#3b82f6');
    
    // Team icon
    drawTeamIcon(ctx, canvas.width / 2 - 100, 320, 20, '#10b981');
    
    return canvas;
  };

  const drawStar = (ctx, x, y, radius, color) => {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.translate(x, y);
    ctx.moveTo(0, -radius);
    for (let i = 0; i < 5; i++) {
      ctx.rotate(Math.PI / 5);
      ctx.lineTo(0, -radius * 0.5);
      ctx.rotate(Math.PI / 5);
      ctx.lineTo(0, -radius);
    }
    ctx.fill();
    ctx.restore();
  };

  const drawTeamIcon = (ctx, x, y, size, color) => {
    ctx.save();
    ctx.fillStyle = color;
    // Draw simple team icon representation
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 1.5, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + size * 3, y, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  };

  const getThemeName = (theme) => {
    const themes = {
      'murder-mystery': 'The Midnight Murder Mystery',
      'haunted-mansion': 'Cursed Manor Investigation',
      'wizards-tower': 'The Enchanted Tower Quest'
    };
    return themes[theme] || 'Digital Adventure';
  };

  const getPerformanceRating = (data) => {
    const { stagesCompleted, hintsUsed, difficulty, answersRevealed = 0 } = data;
    
    if (stagesCompleted === 6 && answersRevealed === 0 && hintsUsed <= 1) return 'Legendary';
    if (stagesCompleted === 6 && answersRevealed === 0 && hintsUsed <= 3) return 'Exceptional';
    if (stagesCompleted === 6 && answersRevealed <= 1) return 'Excellent';
    if (stagesCompleted >= 4) return 'Very Good';
    if (stagesCompleted >= 2) return 'Good';
    return 'Participant';
  };

  const formatCompletionDate = (dateString) => {
    if (dateString) {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date().toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const capitalize = (str) => str.charAt(0).toUpperCase() + str.slice(1);

  const handleDownload = () => {
    const canvas = generateCertificate();
    const link = document.createElement('a');
    const teamName = playerData.teamName ? playerData.teamName.replace(/[^a-zA-Z0-9]/g, '-') : 'team';
    link.download = `${teamName}-escape-room-certificate-${Date.now()}.png`;
    link.href = canvas.toDataURL();
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    if (onDownload) onDownload();
  };

  return (
    <motion.button
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={handleDownload}
      className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-600 text-white font-semibold rounded-xl hover:from-yellow-600 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-yellow-400"
      aria-label="Download team achievement certificate"
    >
      <Award className="w-6 h-6" />
      Download Team Certificate
    </motion.button>
  );
};

export default CertificateGenerator;