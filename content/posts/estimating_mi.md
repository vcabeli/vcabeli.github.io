---
title: Estimating mutual information on finite samples
date: '2021-11-24'
draft: no
bibFile : static/bib.json
---

The previous posts established *why* we would want to estimate
information-theoretic quantities from data, and now we will study *how*
and *how well* it can be done. Several decades of research later, and
almost as many different estimators as there were applications, it may
come as a surprise that many basic questions remain unanswered (although
recent progress has been made, especially in the continuous case). To
understand why, recall that mutual information $\II(X;Y)$ is defined for
$X$ and $Y$ of any dimensions. For example, in many applications in neuroscience,
$X$ may be the activation of hundreds or thousands or neurons, and $Y$ a
single-dimensional stimulus or response. Estimating $\II(X;Y)$ from
sampled data in this setting is a very different problem than estimating
it between two single-dimensional signal! In this section we focus on
the use of (conditional) mutual information for constraint-based
algorithms, where $X$ and $Y$ are single-dimensional variables and $Z$
may be *fewdimensional*, and for which we also need some significance assessment.

### Discrete estimators

Estimating $\II(X;Y)$ on discrete data is the most straightforward case.
We can simply estimate the probability mass functions $\hat{p}(x)$,
$\hat{p}(y)$ and $\hat{p}(x,y)$ from independently and identically
distributed (i.i.d) data by counting how many times we observe each
level. Using the chain rule, we actually only need an entropy
estimator $\hat{H}$ to get an estimation $\hat{\II}$. Using the observed
frequencies $\hat{p}_i$ with $i \in [1,m]$, we get what is called the
\"plug-in\" or \"naive\" estimator :
$$\hat{H}\_\text{Naive} = -\sum\_{i=1}^{m} \hat{p}\_i \log \hat{p}\_i$$ Note that it is
also the maximum likelihood estimator from the observed data. It is
however suboptimal, it has long been known that it is negatively biased
everywhere {{<cite "paninski_estimation_2003">}}. The short explanation is that
while $\hat{p}_i$ is estimated with symmetric variance on either side of
the true frequency $p_i$, the $\log$ transformation amplifies more
variance towards $0$ than towards $1$, and the contribution of each
$\hat{p}_i$ ends up being underestimated on average. To correct this
shortcoming, a common fix is to add the Miller-Madow correction
{{<cite "miller_note_1955">}}:
$$\hat{H}\_\text{MM} = \hat{H}\_\text{Naive} + \frac{\hat{m}-1}{2N}$$ with
$\hat{m}$ the number of categories with nonzero probability as estimated
from the $\hat{p}\_i$. This correction effectively reduces the bias of
$\hat{H}\_\text{Naive}$ without adding any complexity, and is preferred
in many contexts.

Another popular idea is to use a jacknife resampling procedure, which
trades lower bias for a slightly higher complexity
{{<cite "efron_jackknife_1981">}} :
$$\hat{H}\_\text{JK} = N\hat{H}\_\text{Naive} - \frac{N-1}{N} \sum\_{j=1}^N\hat{H}\_{\text{Naive}-j}$$
where $\hat{H}\_{\text{Naive}-j}$ is the naive estimator without the
$j$th sample.

Finally, another way to correct the negative bias of the naive estimator
is to act directly on the estimates $\hat{p}_i$ instead of applying a
correction a posteriori. The Schurmann-Grassberger estimator does
exactly that, by applying prior Bayesian belief that the samples follow
a Dirichlet distribution (the multivariate generalization of the Beta
distribution) {{<cite "schurmann_entropy_1996">}}. It essentially \"tricks\" the
estimator to think that more counts have been observed to compensate for
the negative bias of the naive estimator, such that $mN$ becomes the a
priori sample size. The result is a less biased estimator, but the
choice of the prior end up dominating the estimation
{{<cite "nemenman_entropy_2004">}}.

All of these improved estimators have been designed for the setting
where $I(X;Y) >> 0$, as opposed to constraint-based discovery where we
are more interested in the independence regime. Importantly, they all
share another kind of bias : they overestimate dependencies on finite
data. Without knowing the true distributions, any of these estimators
will be positive $\hat\II(X;Y) > 0$ (resp. $\hat\II(X;Y|Z)>0$) almost
surely, even when $X \indep Y$ (resp. $X \indep Y | Z$). Several
suggestions have been made, mostly based on fixed thresholds as a
function of the sample size. A more inspired approach is to also take
into account the distributions of the variables : indeed, we do not
expect the same bias from sampling simple binary variables with balanced
levels, versus more complicated variables with many unbalanced
categories.

This is the route taken by MIIC{{<cite "cabeli_learning_2020">}}, which corrects the naive estimate by
subtracting a complexity cost that depends on $X$, $Y$ and $Z$. It
frames each test of independence in the context of graph reconstruction,
favoring simpler models with fewer edges. Namely, it introduces a
complexity cost for the edge $X-Y$ potentially separated by separating
set $U_i$, noted $k_{X;Y|\{U_i\}}$. Then, the condition
$\II(X;Y|U_i) < k_{X;Y|\{U_i\}}(N)/N$ to remove the edge $X-Y$ favors
the simpler model compatible with the independencies in the sense of the
model complexity, given the observed data. This replaces the strict
equivalence $\II(X;Y|U_i) = 0 \Leftrightarrow X \indep Y | U_i$ which is
only valid in the limit $N \rightarrow \infty$. The challenge now is to
choose the form of $k_{X;Y|\{U_i\}(N)}$. A common complexity cost used
in model selection would be the Bayesian Information Criterion :
$$k_{X;Y|\{U_i\}}^\text{BIC}(N) = {1\over{2}}(r_X-1)(r_Y-1) \prod_i r_{U_i} \log(N)$$
with $r_X$, $r_Y$, $r_{U_i}$ the number of categories of each variable
($U_i$ being a joint variable). This complexity cost can be improved by
also taking into account the distributions of the variables, not only
their number of levels {{<cite "affeldt_3off2:_2016">}}. Such a score will be
discussed in a future post introducing the new MDL-optimal (Minimum Description Length)
discretization scheme.

### Continuous estimators {#sec:continuous_estimators}

Compared to the discrete case, estimating $\hat\II$ on continuous data
is notoriously difficult. Historically, one of the most common way to
deal with continuous data was to discretize them into bins, the same way
we construct histograms. We note $[X]$ and $[Y]$ the quantized version
of $X$ and $Y$ on finite data. This approach is conceptually
straightforward, we can simply compute $\hat\II([X];[Y])$ with any
discrete estimator and take it as an approximation of $\II(X;Y)$.

Perhaps because we are used to seeing histograms and picking the correct
number of bins visually, surprisingly many applications perform this
kind of naive discretization without much justification. In practice
however, both the number of bins and their locations dominate the
estimation. Even for large $N$, $\hat\II([X],[Y])$ converges on some
value that depends on the discretization parameters rather than
$\II(X;Y)$, namely the number of bins $|\Delta_X|$ and $|\Delta_Y|$, as
well as their size {{<cite "vejmelka_inferring_2008">}}. This bias was already
documented as early as 1989, but was considered manageable if one chose
a \"reasonable number of cells\" {{<cite "moddemeijer_estimation_1989">}}. But the
question of what is \"reasonable\" is more complicated than it appears.
For example, Ross et al. note that there is no optimal value of
$|\Delta|$ that works for all distributions : $N^{0.5}$ works well for
the square wave distribution but $N^{0.7}$ is better for a Gaussian
distribution {{<cite "ross_mutual_2014">}}. Similarly, Seok et al. show that even
for Gaussian bivariate distributions with the same marginals, the
\"correct\" number of bins that gives the best approximation of
$\II(X;Y)$ varies depending on the strength of the correlation $\rho$
{{<cite "seok_mutual_2015">}}. Note that the same applies for any estimator that
takes a number of bins as parameter, regardless of how clever the
discretization scheme is (for example, using B-splines
{{<cite "daub_estimating_2004">}}). Instead, it is essential to deduce the number
of bins from the observations
{{<cite "darbellay_estimation_1999;wang_divergence_2005">}}. Darbellay et al's
recursive partitioning scheme {{<cite "darbellay_estimation_1999">}} is
conceptually one of the closest approach to the novel estimator
introduced in {{<cite "cabeli_learning_2020">}}, but it is limited in the placement of
the bins.

Another common approach is to compute the mutual information using
analytical formulas, having estimated $p(X)$, $p(Y)$ and $p(X,Y)$. It is
only feasible for few applications with strong a priori on the data
distribution, and even if we know the distributions the data is sampled
from, only few analytical formulas for the information are known
{{<cite "darbellay_entropy_2000">}}. Instead of being imposed some priors, the
density functions can also be estimated via the usual methods using e.g.
kernel functions {{<cite "moon_estimation_1995">}}. But, related to the problem of
choosing the number of bins, one has to choose the type of kernel and
its width, which has shown similar bias {{<cite "moddemeijer_estimation_1989">}}.
It is also exponentially more complex as the support's dimensions
increase, limiting its use for conditional independence testing even
with few variable $Z$s in the conditioning set.

Undoubtedly, the best results on continuous data are obtained with the
\"KSG\" estimator from Kraskov, Stögbaueur and Grassberger
{{<cite "kraskov_estimating_2004">}}. We will also refer to this approach as the
$k$-nn approach, as it employs a $k$-nearest neighbor estimation of the
local entropy. It is based on earlier work by Kozachenko and Leonenko,
who first derived an estimate of the entropy based on nearest-neighbor
distances {{<cite "kozachenko_sample_1987">}} :
$$\hat{H}\_\text{KL}(X) = \frac{1}{N}\sum\_{i=1}^N\log \left( \frac{Nc\_{d,p}\rho_{k,i}}{k} \right) + \log(k) - \psi(k)$$
with $\rho_{k,i}$ the distance from the $j$th sample to its $k$th
nearest neighbor, $c_d$ the volume of the unit ball in $d$ dimensions
and $\psi(.)$ the digamma function. The original authors introduced this
formula for a fixed $k=1$, proving its consistency as $N$ increases, and
{{<cite "singh_nearest_2003">}} proved it later for all $k$. Additionally, Jiao et
al. derived an uniform upper bound on its performance proving its near
optimality {{<cite "jiao_nearest_2018">}}, a first for such estimators.

Given this strong estimator, a natural way to get to $\hat\II$ is to use
the chain rule :
$$\hat\II\_\text{3KL} = \hat{H}\_\text{KL}(X) + \hat{H}\_\text{KL}(Y) - \hat{H}\_\text{KL}(X,Y)$$
This estimator is also consistent and performs fairly well in practice,
but was shown to be uniformly inferior to the KSG estimator in many
empirical settings. The KSG estimator is defined as :
$$\hat\II_\text{KSG}(X;Y) = \psi(k) + \psi(N) - \left< \psi(n_{x,i}+1) + \psi(n_{y,i}+1)\right>$$
with $n_{x,i}$ the number of points within an $\rho_{k,i}$ distance on
the $X$ dimension, and $\left< \psi(n_x+1) + \psi(n_y+1)\right>$ the
average taken on all samples. The $\rho_{k_i}$ distance is usually taken
with $\ell_\infty$ or $\ell^2$ norm (see next figure). Since its introduction, no other
estimator seems to be as performant in most settings and it has become
the go-to solution to estimate $\hat\II$ on continuous data. The
particularity behind the KSG estimator is to compare $H(X)$, $H(Y)$ and
$H(X,Y)$ locally to estimate the mutual information directly, instead of
having to estimate each of the three terms. Recently, Gao et al.
revealed why this choice leads to uniformly better results than the
$\hat\II_\text{3KL}$ estimator. They have shown that the better
performance stems from a *correlation boosting* effect, the bias of the
joint entropy is positively correlated to the biases of the marginal
entropies, which partly cancel each other when subtracting via the chain
rule {{<cite "gao_demystifying_2016">}}. It makes no assumption on either the
marginal or joint distributions, and seems to be equitable to all
relationships {{<cite "kinney_equitability_2014">}}. Somewhat surprisingly,
rank-ordering the variables still gives correct estimates (as it
should), although it is not clear whether it should be preferred or not.

{{< figure src="/media/ksg.png" width="90%" align="center" title="Choice of the $\rho_{k,i}$ distance with $\ell_\infty$ norm (left) or $\ell^2$ norm (righ) for the KSG estimator. Figure taken from Gao et al. 2016">}}

It was conveniently adapted to the conditional case, also using a direct
formula instead of the chain rule
{{<cite "vejmelka_inferring_2008;tsimpiris_nearest_2012">}} :
$$\hat\II_\text{KSG}(X;Y|Z) = \psi(k) + \left< \psi(n_{z,i}+1) - \psi(n_{xz,i}+1)  - \psi(n_{yz,i}+1)\right>$$

Still, we note a few disadvantages that discourage its use for general
constraint-based algorithms. First, the variance and bias of the
estimation are tied to the choice of the parameter $k$
{{<cite "perez-cruz_estimation_2009">}}. The original authors themselves suggest a
low $k$ ($2-4$) for good a estimation $\hat\II_\text{KSG}$, and much
larger for independence testing (up to $\simeq N/2$). In general, the
trade-off is high variance and low bias for small values of $k$, and
less variance but increased bias for large $k$
{{<cite "kinney_equitability_2014;holmes_estimation_2019">}}. Secondly, as is
the case with discrete estimators, the equivalence
$\hat\II(X;Y) = 0 \Leftrightarrow X \indep Y$ is not respected, as
variance still exists at independence. Crucially, there are currently no
results on the distribution of the estimator, either exact nor
asymptotically, and there is no easy way to test for independence
{{<cite "paninski_estimation_2003;perez-cruz_estimation_2009">}}. Runge proposed
to test for conditional independence using a local permutations scheme,
which reliably estimates the null distribution but requires
significantly more computation {{<cite "runge_conditional_2018">}}. Berrett and
Samworth improved slightly on this idea, introducing an independence
test based on either simulations when marginal distributions are known,
or resampling when they are not {{<cite "berrett_nonparametric_2019">}}.

Many other estimators exist, involving ensemble methods
{{<cite "moon_ensemble_2017">}}, copula transformations {{<cite "ince_statistical_2017">}},
dependence graphs {{<cite "noshad_scalable_2018">}}, and even deep neural networks
{{<cite "belghazi_mine:_2018">}}. Overall, the KSG estimator has shown the best
performance in the settings that interest us, and is the best
understood. It has even been adapted to the mixed case and mixture
variables, as we shall see now.

### Mixed estimators

Compared to the discrete and the continuous case, relatively little work
has been done on estimating mutual information in the mixed case, where
$X$ is discrete and $Y$ is continuous, and even less in the case of
mixture variables.

Ross et al. extended the KSG estimator to the mixed case, by counting
the number of nearest neighbors in the continuous space $Y$ on the
subset of samples that share the same discrete value of $X$. More
specifically, for each sample $i$, the method first finds the distance
to the $k$th nearest neighbor which also share the same discrete value,
and counts the number of neighbors within this distance in the full
data, noted $m$. This estimator is given by :
$$\hat\II_\text{Ross}(X;Y) = \psi(N) + \psi(k) - \left< \psi(N_X) - \psi(m+1) )\right>$$
with $N_X$ the total number of data points that share the same discrete
value on $X$.

It was then expanded by Gao et al. to mixture distributions by taking
the average of the Radon-Nikodym derivative over all samples
{{<cite "gao_estimating_2017">}}. The way to estimate this derivative depends on
each sample : plug-in estimator when the point is discrete (*i.e.* more
than $k$ point share the same value, so $\rho_{i,k}=0$), and KSG
estimator when there is a locally continuous joint density. The
intuition behind this procedure is that the Radon-Nikodym derivative is
well defined for all cases, and that it recovers either the plug-in
estimator, the KSG estimator, or Ross's estimator depending on the local
subspace. By then taking the average of all the derivatives, this gives
the value $\hat\II(X;Y)$ for any distributions $X$ and $Y$. It was
proven to be consistent, and has shown better results than binning
procedures or noisy KSG on mixture variables. It shares however the same
lack of significance test as the other $k$-nn estimators, which makes it
less adapted to constraint-based algorithms.

Marx et al. also proposed a mixed estimator based on the Radon-Nikodym
derivative and adaptive histogram models for the continuous parts of the
mixture variables {{<cite "marx_estimating_2021">}}. Just as our approach
introduced in {{<cite "cabeli_learning_2020">}}, they devised an heuristic to find
the optimal discretization according to the Minimum Description Length
(MDL) principle {{<cite "rissanen_modeling_1978">}}. It also comes with easy
independence testing with Normalised Maximum Likelihood (NML) correction
on discrete data, as introduced in {{<cite "affeldt_3off2:_2016">}} using the
factorized NML criteria {{<cite "roos_bayesian_2008">}} (which was later redefined
by Marx et al., proving asymptotic behavior and consistency
{{<cite "marx_stochastic_2018">}}). It is well adapted to constraint-based
algorithms, however it considers mixture variable in a slightly
different way from Gao et al (and {{<cite "cabeli_learning_2020">}}).

This difference is best explained through an example. Let $(X,Y)$ be a
mixture of one continuous and one discrete distribution. The continuous
distribution is a bivariate Gaussian, with mean $\mu = 0$, marginal
variance $\sigma=1$ and correlation $\rho$. The discrete distribution is
two binary variables, with probabilities
$p(X=1,Y=1) = p(X=-1,Y=-1) = \beta$ and
$p(X=1,Y=-1) = p(X=-1,Y=1) = \beta$. These two distributions are then
mixed with probability $p_{con}$ and $p_{dis}$ respectively. The ground
truth as derived by Gao et al. is given by :

$$\begin{aligned}
 \label{eq:mixture}
    \begin{split}
    \II(X;Y) = & \frac{-p_{con}}{2} \times \log(1 - \rho^2) + \frac{\beta}{2} \times \log\frac{\beta/2}{p_{dis}^2} + \frac{(1 - \beta)}{2} \times \log\frac{(1-\beta)/2}{p_{dis}^2} \\\\
    & - p_{con}\times \log p_{con} - p_{dis}\times \log p_{dis} 
    \end{split}\end{aligned}$$

Marx et al. used a different ground truth for this distribution, without
the last two terms of the sum,
$- p_{con}\times \log p_{con} - p_{dis}\times \log p_{dis}$. In their
framework, $X \indep Y$ and $\II(X;Y)=0$ if and only if $\rho=0$ and
$\beta=0.5$. It is justified if one considers that the continuous and
discrete parts do not share the same space, acting more like separate
dimensions of the joint distribution. On the other hand, if we consider
that all parts of $X$ and $Y$ share the same euclidean space, some
information is \"created\" from the structure of the joint distribution,
given by $- p_{con}\times \log p_{con} - p_{dis}\times \log p_{dis}$
(which equals to $\log2$ when $p_{con} = p_{dis} = 0.5$). Indeed, even
when $\rho=0$ and $\beta=0.5$, the distribution $p(x,y)$ is far from
$p(x)p(y)$ due to the constraints imposed by sharing the same space:

{{< figure src="/media/mixed_shuf_separated.png" width="60%" align="center" title="Discrete and continuous parts are kept separated, as in different dimensions. The mutual information is $\log 2$, as measured by our optimal discretization scheme">}}
{{< figure src="/media/mixed_shuf.png" width="60%" align="center" title="All data points are on the same euclidean space and the null hypothesis is $p(x,y)=p(x)p(y)$, and $\II(X;Y)=0$">}}

The second view is closer to the master definition of mutual information
 which implies that we can use any
partitioning to discretize $X$ and $Y$, potentially combining discrete
and continuous parts in a single bin. This also corresponds to the
approach taken to develop our own estimator and significance test based on optimal binning of
$X,Y$, introduced in a future post.
