package com.crypto.market.insight.domain.user.model.entity;

import com.crypto.market.insight.common.entity.BaseEntity;
import com.crypto.market.insight.domain.user.model.vo.AuthProvider;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.Table;
import lombok.AccessLevel;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "users")
@Getter
@NoArgsConstructor(access = AccessLevel.PROTECTED)
public class User extends BaseEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String email;

    @Column(nullable = false)
    private String nickname;

    private String profileImage;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private AuthProvider provider;

    @Column(nullable = false)
    private String providerId;

    @Builder
    public User(String email, String nickname, String profileImage,
                AuthProvider provider, String providerId) {
        this.email = email;
        this.nickname = nickname;
        this.profileImage = profileImage;
        this.provider = provider;
        this.providerId = providerId;
    }

    public void updateProfile(String nickname, String profileImage) {
        this.nickname = nickname;
        this.profileImage = profileImage;
    }
}
