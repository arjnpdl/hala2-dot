from sqlalchemy import Column, String, Text, Integer, Float, ForeignKey, JSON, Enum as SQLEnum
from sqlalchemy.orm import relationship
from database import Base
import uuid
from enum import Enum

# MySQL doesn't have native vector support without extensions
HAS_PGVECTOR = False
Vector = lambda size: Text  # Return Text type instead


class UserRole(str, Enum):
    FOUNDER = "FOUNDER"
    TALENT = "TALENT"
    INVESTOR = "INVESTOR"


class MatchStatus(str, Enum):
    PENDING = "PENDING"
    ACCEPTED = "ACCEPTED"
    REJECTED = "REJECTED"


class FundingStage(str, Enum):
    PRE_SEED = "pre-seed"
    SEED = "seed"
    SERIES_A = "series-a"
    SERIES_B = "series-b"
    SERIES_C = "series-c"


class EngagementType(str, Enum):
    FULL_TIME = "full-time"
    PART_TIME = "part-time"
    EQUITY_ONLY = "equity-only"
    INTERNSHIP = "internship"


class User(Base):
    __tablename__ = "users"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String(255), unique=True, nullable=False, index=True)
    password_hash = Column(String(255), nullable=False)
    role = Column(SQLEnum(UserRole), nullable=False, index=True)
    profile_data = Column(JSON, default={})
    created_at = Column(String(50))  # ISO timestamp string
    
    # Relationships
    talent_profile = relationship("TalentProfile", back_populates="user", uselist=False)
    startup_profile = relationship("StartupProfile", back_populates="user", uselist=False)
    investor_profile = relationship("InvestorProfile", back_populates="user", uselist=False)
    embeddings = relationship("Embedding", back_populates="user")
    sent_connections = relationship("Match", foreign_keys="Match.requester_id", back_populates="requester")
    received_connections = relationship("Match", foreign_keys="Match.target_id", back_populates="target")


class TalentProfile(Base):
    __tablename__ = "talent_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255))
    photo = Column(String(500))  # S3 URL
    headline = Column(String(255))
    location = Column(String(100))
    skills = Column(JSON)  # [{name: str, proficiency: str}]
    bio = Column(Text)
    cv_path = Column(String(500))  # Local path to uploaded CV
    experience_level = Column(String(50))
    portfolio_links = Column(JSON)  # [{type: str, url: str}]
    completeness_score = Column(Float, default=0.0)
    updated_at = Column(String(50))
    
    user = relationship("User", back_populates="talent_profile")


class StartupProfile(Base):
    __tablename__ = "startup_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255))
    tagline = Column(String(255))
    logo = Column(String(500))  # S3 URL
    industry = Column(String(100))
    stage = Column(SQLEnum(FundingStage))
    website = Column(String(255))
    founding_year = Column(Integer)
    mrr = Column(Float)
    user_count = Column(Integer)
    growth_rate = Column(Float)
    funding_goal = Column(Float)
    equity_offered = Column(Float)
    use_of_funds = Column(Text)
    tech_stack = Column(JSON)
    required_skills = Column(JSON)
    problem_statement = Column(Text)
    team_members = Column(JSON)  # [{name: str, role: str}]
    open_roles_count = Column(Integer, default=0)
    completeness_score = Column(Float, default=0.0)
    updated_at = Column(String(50))
    
    user = relationship("User", back_populates="startup_profile")
    job_postings = relationship("JobPosting", back_populates="startup")


class JobPosting(Base):
    __tablename__ = "job_postings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    startup_id = Column(String(36), ForeignKey("startup_profiles.id"), nullable=False)
    title = Column(String(255), nullable=False)
    description = Column(Text)
    requirements = Column(Text)
    required_skills = Column(JSON)  # ["Python", "React", etc.]
    location = Column(String(100))
    job_type = Column(String(50))  # full-time, part-time, etc.
    compensation = Column(String(100))
    created_at = Column(String(50))
    updated_at = Column(String(50))
    
    startup = relationship("StartupProfile", back_populates="job_postings")


class InvestorProfile(Base):
    __tablename__ = "investor_profiles"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), unique=True, nullable=False)
    name = Column(String(255))
    fund = Column(String(255))
    type = Column(String(50))  # 'angel', 'vc', 'diaspora'
    investment_stage = Column(JSON)  # [FundingStage]
    thesis_text = Column(Text)
    preferred_sectors = Column(JSON)
    check_size_min = Column(Float)
    check_size_max = Column(Float)
    geography_focus = Column(String(100))
    key_signals = Column(JSON)
    completeness_score = Column(Float, default=0.0)
    updated_at = Column(String(50))
    
    user = relationship("User", back_populates="investor_profile")


class Embedding(Base):
    __tablename__ = "embeddings"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String(36), ForeignKey("users.id"), nullable=False, index=True)
    embedding = Column(JSON)  # Store as JSON list for MySQL
    text_source = Column(String(100))  # 'profile', 'thesis', 'role_posting'
    created_at = Column(String(50))
    
    user = relationship("User", back_populates="embeddings")


class Match(Base):
    __tablename__ = "matches"
    
    id = Column(String(36), primary_key=True, default=lambda: str(uuid.uuid4()))
    requester_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    target_id = Column(String(36), ForeignKey("users.id"), nullable=False)
    job_id = Column(String(36), ForeignKey("job_postings.id"), nullable=True)
    match_score = Column(Float)
    status = Column(SQLEnum(MatchStatus), default=MatchStatus.PENDING)
    message = Column(Text)
    created_at = Column(String(50))
    
    requester = relationship("User", foreign_keys=[requester_id], back_populates="sent_connections")
    target = relationship("User", foreign_keys=[target_id], back_populates="received_connections")
    job = relationship("JobPosting")
